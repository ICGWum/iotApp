import { useState, useEffect } from "react";
import { Animated, Alert } from "react-native";
import { db, deleteDocument } from "../../Firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import * as ImagePicker from "expo-image-picker";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

const COLLECTION_NAME = "equipment";

export default function useEquipmentManagement() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoEquipment, setInfoEquipment] = useState(null);
  const [tags, setTags] = useState({});
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanningIndex, setScanningIndex] = useState(1);
  const [scannedTags, setScannedTags] = useState({});
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [debiet, setDebiet] = useState("");
  const [druk, setDruk] = useState("");
  const [aantalKoppelingen, setAantalKoppelingen] = useState(0);
  const [imageUri, setImageUri] = useState("");
  const [expandedTags, setExpandedTags] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteAnim] = useState(new Animated.Value(0));
  const [werktuigNfc, setWerktuigNfc] = useState("");

  useEffect(() => {
    fetchEquipment();
    NfcManager.start();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const equipmentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEquipment(equipmentList);
    } catch (error) {
      showMessage({
        message: "Fout bij laden van werktuigen",
        description: error.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const koppelingen = aantalKoppelingen;
    if (!isNaN(koppelingen) && koppelingen > 0) {
      setTags((prevTags) => {
        const updatedTags = { ...prevTags };
        for (let i = 1; i <= koppelingen; i++) {
          if (!(i in updatedTags)) {
            updatedTags[i] = "";
          }
        }
        Object.keys(updatedTags).forEach((key) => {
          if (parseInt(key) > koppelingen) delete updatedTags[key];
        });
        return updatedTags;
      });
    } else {
      setTags({});
    }
  }, [aantalKoppelingen]);

  const resetForm = () => {
    setName("");
    setType("");
    setBrand("");
    setSerialNumber("");
    setDebiet("");
    setDruk("");
    setAantalKoppelingen(0);
    setCurrentEquipment(null);
    setEditMode(false);
    setModalVisible(false); // Ensure modal closes on cancel
  };

  const handleAddEquipment = () => {
    resetForm();
    setTags({});
    setScannedTags({});
    setImageUri("");
    setModalVisible(true);
  };

  const handleEditEquipment = (equipment) => {
    setCurrentEquipment(equipment);
    setName(equipment.name || "");
    setType(equipment.type || "");
    setBrand(equipment.brand || "");
    setSerialNumber(equipment.serialNumber || "");
    setDebiet(equipment.debiet ? equipment.debiet.toString() : "");
    setDruk(equipment.druk ? equipment.druk.toString() : "");
    setAantalKoppelingen(
      typeof equipment.aantalKoppelingen === "number"
        ? equipment.aantalKoppelingen
        : equipment.aantalKoppelingen
        ? parseInt(equipment.aantalKoppelingen)
        : 0
    );
    setTags(equipment.tags || {});
    setImageUri(equipment.imageUri || "");
    setEditMode(true);
    setModalVisible(true);
  };

  const handleInfoEquipment = (equipment) => {
    setInfoEquipment(equipment);
    setInfoModalVisible(true);
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSaveEquipment = async () => {
    if (!name || !type) {
      showMessage({
        message: "Verplichte velden ontbreken",
        description: "Naam en type zijn verplicht",
        type: "warning",
      });
      return;
    }
    if (!imageUri) {
      showMessage({
        message: "Afbeelding vereist",
        description: "Upload een afbeelding van het werktuig",
        type: "warning",
      });
      return;
    }
    const tagsToSave = Object.keys(scannedTags).length > 0 ? scannedTags : tags;
    try {
      const equipmentData = {
        name,
        type,
        brand,
        serialNumber,
        debiet: debiet ? parseFloat(debiet) : null,
        druk: druk ? parseFloat(druk) : null,
        aantalKoppelingen: aantalKoppelingen,
        tags: { ...tagsToSave },
        imageUri,
        tag: werktuigNfc ? String(werktuigNfc) : "",
        updatedAt: new Date(),
      };
      const equipmentId = name.trim();
      if (!equipmentId) {
        showMessage({
          message: "Naam is verplicht als ID",
          type: "warning",
        });
        return;
      }
      if (editMode && currentEquipment) {
        if (currentEquipment.id !== equipmentId) {
          await deleteDocument(COLLECTION_NAME, currentEquipment.id);
          const equipmentRef = doc(db, COLLECTION_NAME, equipmentId);
          await setDoc(equipmentRef, {
            ...equipmentData,
            createdAt: new Date(),
          });
        } else {
          const equipmentRef = doc(db, COLLECTION_NAME, equipmentId);
          await updateDoc(equipmentRef, equipmentData);
        }
        showMessage({ message: "Werktuig bijgewerkt", type: "success" });
      } else {
        const equipmentRef = doc(db, COLLECTION_NAME, equipmentId);
        await setDoc(equipmentRef, { ...equipmentData, createdAt: new Date() });
        showMessage({ message: "Werktuig toegevoegd", type: "success" });
      }
      setModalVisible(false);
      resetForm();
      fetchEquipment();
    } catch (error) {
      showMessage({
        message: "Fout bij opslaan",
        description: error.message,
        type: "danger",
      });
    }
  };

  const handleDeleteEquipment = async (equipment) => {
    const result = await deleteDocument(COLLECTION_NAME, equipment.id);
    if (result.success) {
      setEquipment((prev) => prev.filter((e) => e.id !== equipment.id));
      setInfoModalVisible(false); // Close info modal after deletion
      showMessage({ message: "Werktuig verwijderd", type: "success" });
    } else {
      showMessage({
        message: "Fout bij verwijderen",
        description: result.error.message,
        type: "danger",
      });
    }
  };

  const confirmDeleteEquipment = (equipment) => {
    Alert.alert(
      "Bevestig verwijderen",
      `Weet je zeker dat je werktuig '${equipment.name}' wilt verwijderen?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: () => handleDeleteEquipment(equipment),
        },
      ]
    );
  };

  const handleSaveScannedTags = async () => {
    if (!currentEquipment) return;
    try {
      const updatedEquipment = {
        ...currentEquipment,
        tags: scannedTags,
        updatedAt: new Date(),
      };
      const equipmentRef = doc(db, COLLECTION_NAME, currentEquipment.id);
      await updateDoc(equipmentRef, {
        tags: scannedTags,
        updatedAt: new Date(),
      });
      setEquipment((prev) => {
        const updated = prev.map((e) =>
          e.id === currentEquipment.id ? updatedEquipment : e
        );
        // Also update infoEquipment if it's open
        if (infoEquipment && infoEquipment.id === currentEquipment.id) {
          setInfoEquipment(updatedEquipment);
        }
        return updated;
      });
      showMessage({
        message: "Koppelingen succesvol opgeslagen!",
        type: "success",
      });
      setScanModalVisible(false);
      setCurrentEquipment(null);
    } catch (error) {
      showMessage({
        message: "Fout bij opslaan van koppelingen",
        description: error.message,
        type: "danger",
      });
    }
  };

  const handleScanModalOpen = (equipment) => {
    setCurrentEquipment(equipment);
    setScannedTags(equipment.tags || {});
    setScanningIndex(1);
    setScanModalVisible(true);
  };

  const handleNfcScan = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if (tag && tag.id) {
        setScannedTags((prev) => ({ ...prev, [scanningIndex]: tag.id }));
        showMessage({
          message: `Koppeling ${scanningIndex} gescand!`,
          description: `Tag ID: ${tag.id}`,
          type: "success",
        });
      } else {
        showMessage({ message: "Geen tag gevonden", type: "warning" });
      }
    } catch (ex) {
      if (ex.message !== "cancelled") {
        showMessage({
          message: "Fout bij NFC scan",
          description: ex.message,
          type: "danger",
        });
      }
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  const scanWerktuigNfc = async () => {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    if (tag && tag.id) {
      setWerktuigNfc(tag.id.toString());
      showMessage({
        message: `Werktuig NFC gescand!`,
        description: `Tag ID: ${tag.id}`,
        type: "success",
      });
      return tag; // <-- ADD THIS LINE
    } else {
      showMessage({ message: "Geen tag gevonden", type: "warning" });
      return null; // <-- ADD THIS LINE
    }
  } catch (ex) {
    if (ex.message !== "cancelled") {
      showMessage({
        message: "Fout bij NFC scan",
        description: ex.message,
        type: "danger",
      });
    }
    return null; // <-- ADD THIS LINE
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};

  // Add handler for next koppeling scan
  const handleNextScan = () => {
    if (
      currentEquipment &&
      scanningIndex < parseInt(currentEquipment.aantalKoppelingen)
    ) {
      setScanningIndex((prev) => prev + 1);
    } else if (
      currentEquipment &&
      scanningIndex === parseInt(currentEquipment.aantalKoppelingen)
    ) {
      // Go to overview by incrementing scanningIndex out of range
      setScanningIndex((prev) => prev + 1);
    }
  };

  return {
    equipment,
    setEquipment,
    loading,
    setLoading,
    modalVisible,
    setModalVisible,
    editMode,
    setEditMode,
    currentEquipment,
    setCurrentEquipment,
    infoModalVisible,
    setInfoModalVisible,
    infoEquipment,
    setInfoEquipment,
    tags,
    setTags,
    scanModalVisible,
    setScanModalVisible,
    scanningIndex,
    setScanningIndex,
    scannedTags,
    setScannedTags,
    name,
    setName,
    type,
    setType,
    brand,
    setBrand,
    serialNumber,
    setSerialNumber,
    debiet,
    setDebiet,
    druk,
    setDruk,
    aantalKoppelingen,
    setAantalKoppelingen,
    imageUri,
    setImageUri,
    expandedTags,
    setExpandedTags,
    deleteConfirmId,
    setDeleteConfirmId,
    deleteAnim,
    fetchEquipment,
    resetForm,
    handleAddEquipment,
    handleEditEquipment,
    handleInfoEquipment,
    handlePickImage,
    handleSaveEquipment,
    handleDeleteEquipment,
    confirmDeleteEquipment,
    handleSaveScannedTags,
    handleScanModalOpen,
    handleNfcScan,
    handleNextScan,
    werktuigNfc,
    setWerktuigNfc,
    scanWerktuigNfc,
  };
}
