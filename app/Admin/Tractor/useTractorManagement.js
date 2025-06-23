import { useState, useEffect } from "react";
import { Platform, Animated, Alert } from "react-native";
import { db, deleteDocument } from "../../Firebase";
import {
  collection,
  getDocs,
  updateDoc,
  query,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import * as ImagePicker from "expo-image-picker";

const COLLECTION_NAME = "tractors";

export default function useTractorManagement() {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTractor, setCurrentTractor] = useState(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [power, setPower] = useState("");
  const [year, setYear] = useState("");
  const [aantalKoppelingen, setAantalKoppelingen] = useState("");
  const [tags, setTags] = useState({});
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanningIndex, setScanningIndex] = useState(1);
  const [scannedTags, setScannedTags] = useState({});
  const [scanTargetTractor, setScanTargetTractor] = useState(null);
  const [imageUri, setImageUri] = useState("");
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoTractor, setInfoTractor] = useState(null);
  const [expandedTags, setExpandedTags] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteAnim] = useState(new Animated.Value(0));
  const [tractorNfc, setTractorNfc] = useState("");

  useEffect(() => {
    if (Platform.OS !== "web") {
      NfcManager.start();
    }
  }, []);

  const fetchTractors = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const tractorList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTractors(tractorList);
    } catch (error) {
      showMessage({
        message: "Fout bij laden van tractoren",
        description: error.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTractors();
  }, []);

  useEffect(() => {
    const koppelingen = parseInt(aantalKoppelingen);
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
    setBrand("");
    setModel("");
    setSerialNumber("");
    setPower("");
    setYear("");
    setAantalKoppelingen("");
    setTags({});
    setCurrentTractor(null);
    setEditMode(false);
    setTractorNfc(""); // Reset tractor NFC tag as well
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

  const handleAddTractor = () => {
    resetForm();
    setImageUri("");
    setModalVisible(true);
  };

  const handleEditTractor = (tractor) => {
    setCurrentTractor(tractor);
    setName(tractor.name || "");
    setBrand(tractor.brand || "");
    setModel(tractor.model || "");
    setSerialNumber(tractor.serialNumber || "");
    setPower(tractor.power ? tractor.power.toString() : "");
    setYear(tractor.year ? tractor.year.toString() : "");
    setAantalKoppelingen(
      tractor.aantalKoppelingen ? tractor.aantalKoppelingen.toString() : ""
    );
    setTags(tractor.tags || {});
    setImageUri(tractor.imageUri || "");
    setEditMode(true);
    setModalVisible(true);
  };

  const handleSaveTractor = async () => {
    if (
      !name ||
      !brand ||
      !model ||
      !power ||
      !year ||
      !aantalKoppelingen ||
      !tractorNfc
    ) {
      showMessage({
        message: "Verplichte velden ontbreken",
        description:
          "Naam, merk, model, vermogen, bouwjaar, aantal koppelingen en tractor NFC zijn verplicht",
        type: "warning",
      });
      return;
    }
    if (!imageUri) {
      showMessage({
        message: "Afbeelding vereist",
        description: "Upload een afbeelding van de tractor",
        type: "warning",
      });
      return;
    }
    try {
      const tractorData = {
        name,
        brand,
        model,
        serialNumber,
        power: power ? parseInt(power) : null,
        year: year ? parseInt(year) : null,
        aantalKoppelingen: aantalKoppelingen
          ? parseInt(aantalKoppelingen)
          : null,
        tags,
        imageUri,
        tag: tractorNfc ? String(tractorNfc) : "",
        updatedAt: new Date(),
      };
      let tractorId = name.trim();
      if (!tractorId) {
        showMessage({
          message: "Naam is verplicht als ID",
          type: "warning",
        });
        return;
      }
      if (editMode && currentTractor) {
        if (currentTractor.id !== tractorId) {
          await deleteDocument(COLLECTION_NAME, currentTractor.id);
          const tractorRef = doc(db, COLLECTION_NAME, tractorId);
          await setDoc(tractorRef, {
            ...tractorData,
            createdAt: currentTractor.createdAt || new Date(),
          });
        } else {
          const tractorRef = doc(db, COLLECTION_NAME, tractorId);
          await updateDoc(tractorRef, tractorData);
        }
        showMessage({ message: "Tractor bijgewerkt", type: "success" });
      } else {
        const tractorRef = doc(db, COLLECTION_NAME, tractorId);
        await setDoc(tractorRef, { ...tractorData, createdAt: new Date() });
        showMessage({ message: "Tractor toegevoegd", type: "success" });
      }
      setModalVisible(false);
      resetForm();
      fetchTractors();
    } catch (error) {
      showMessage({
        message: "Fout bij opslaan",
        description: error.message,
        type: "danger",
      });
    }
  };

  const deleteTractor = async (tractorId) => {
    const result = await deleteDocument(COLLECTION_NAME, tractorId);
    if (result.success) {
      setTractors((prev) => prev.filter((t) => t.id !== tractorId));
      showMessage({ message: "Tractor verwijderd", type: "success" });
    } else {
      showMessage({
        message: "Fout bij verwijderen",
        description: result.error.message,
        type: "danger",
      });
    }
  };

  const handleDeletePress = (tractorId) => {
    setDeleteConfirmId(tractorId);
    deleteAnim.setValue(0);
    Animated.timing(deleteAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      setDeleteConfirmId(null);
    });
  };

  const confirmDeleteTractor = (tractorId) => {
    Alert.alert(
      "Bevestig verwijderen",
      "Weet je zeker dat je deze tractor wilt verwijderen?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: () => deleteTractor(tractorId),
        },
      ]
    );
  };

  const handleOpenScanModal = (tractor) => {
    setScanTargetTractor(tractor);
    setScannedTags(tractor.tags || {});
    setScanningIndex(1);
    setScanModalVisible(true);
  };

  const handleSaveScannedTags = async () => {
    if (!scanTargetTractor) return;
    try {
      const updatedTractor = {
        ...scanTargetTractor,
        tags: scannedTags,
        updatedAt: new Date(),
      };
      const tractorRef = doc(db, COLLECTION_NAME, scanTargetTractor.id);
      await updateDoc(tractorRef, { tags: scannedTags, updatedAt: new Date() });
      setTractors((prev) =>
        prev.map((t) => (t.id === scanTargetTractor.id ? updatedTractor : t))
      );
      showMessage({
        message: "Koppelingen succesvol opgeslagen!",
        type: "success",
      });
      setScanModalVisible(false);
      setScanTargetTractor(null);
    } catch (error) {
      showMessage({
        message: "Fout bij opslaan van koppelingen",
        description: error.message,
        type: "danger",
      });
    }
  };

  const scanNfcTag = async (koppelingNum) => {
    try {
      await NfcManager.start();
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      const tagId =
        tag.id ||
        (tag.ndefMessage && tag.ndefMessage[0]?.id) ||
        `NFC_TAG_${Date.now()}`;
      setScannedTags((prev) => ({ ...prev, [koppelingNum]: tagId }));
      showMessage({
        message: `Koppeling ${koppelingNum} gescand!`,
        type: "success",
      });
    } catch (e) {
      showMessage({ message: `Scan geannuleerd of mislukt`, type: "warning" });
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  const scanTractorNfc = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if (tag && tag.id) {
        setTractorNfc(tag.id.toString());
        showMessage({
          message: `Tractor NFC gescand!`,
          description: `Tag ID: ${tag.id}`,
          type: "success",
        });
      } else {
        showMessage({ message: "Geen tag gevonden", type: "warning" });
      }
    } catch (e) {
      if (e.message !== "cancelled") {
        showMessage({
          message: "Fout bij NFC scan",
          description: e.message,
          type: "danger",
        });
      }
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  return {
    tractors,
    setTractors,
    loading,
    setLoading,
    modalVisible,
    setModalVisible,
    editMode,
    setEditMode,
    currentTractor,
    setCurrentTractor,
    name,
    setName,
    brand,
    setBrand,
    model,
    setModel,
    serialNumber,
    setSerialNumber,
    power,
    setPower,
    year,
    setYear,
    aantalKoppelingen,
    setAantalKoppelingen,
    tags,
    setTags,
    scanModalVisible,
    setScanModalVisible,
    scanningIndex,
    setScanningIndex,
    scannedTags,
    setScannedTags,
    scanTargetTractor,
    setScanTargetTractor,
    imageUri,
    setImageUri,
    infoModalVisible,
    setInfoModalVisible,
    infoTractor,
    setInfoTractor,
    expandedTags,
    setExpandedTags,
    deleteConfirmId,
    setDeleteConfirmId,
    deleteAnim,
    fetchTractors,
    resetForm,
    handlePickImage,
    handleAddTractor,
    handleEditTractor,
    handleSaveTractor,
    deleteTractor,
    handleDeletePress,
    confirmDeleteTractor,
    handleOpenScanModal,
    handleSaveScannedTags,
    scanNfcTag,
    scanTractorNfc,
  };
}
