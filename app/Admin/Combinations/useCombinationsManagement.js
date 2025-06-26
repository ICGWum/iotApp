import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { db, deleteDocument } from "../../Firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

const COMBINATIONS_COLLECTION = "combinations";
const TRACTORS_COLLECTION = "tractors";
const EQUIPMENT_COLLECTION = "equipment";

export default function useCombinationsManagement() {
  const navigation = useNavigation();
  const [combinations, setCombinations] = useState([]);
  const [tractors, setTractors] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCombination, setCurrentCombination] = useState(null);
  const [selectedTractorId, setSelectedTractorId] = useState(null);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([]);
  const [combinationName, setCombinationName] = useState("");
  const [combinationDescription, setCombinationDescription] = useState("");
  const [tractorModalVisible, setTractorModalVisible] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [connectionMappingModalVisible, setConnectionMappingModalVisible] =
    useState(false);
  const [currentMappingEquipment, setCurrentMappingEquipment] = useState(null);
  const [connectionMappings, setConnectionMappings] = useState({});
  const [addComboStep, setAddComboStep] = useState(0);
  const [tractorPreview, setTractorPreview] = useState(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsTractor, setSettingsTractor] = useState(null);
  const [selectedWerktuigId, setSelectedWerktuigId] = useState(null);
  const [eyeModalVisible, setEyeModalVisible] = useState(false);
  const [eyeTractor, setEyeTractor] = useState(null);
  const [koppelingMappingModalVisible, setKoppelingMappingModalVisible] =
    useState(false);
  const [mappingWerktuig, setMappingWerktuig] = useState(null);
  const [mappingTractor, setMappingTractor] = useState(null);
  const [mappingPairs, setMappingPairs] = useState([]);
  const [remainingWerktuigKoppelingen, setRemainingWerktuigKoppelingen] =
    useState([]);
  const [remainingTractorKoppelingen, setRemainingTractorKoppelingen] =
    useState([]);
  const [savingMapping, setSavingMapping] = useState(false);
  const [mappingCombinationId, setMappingCombinationId] = useState(null);
  const [koppelingMappingError, setKoppelingMappingError] = useState("");
  const [nfcScanStep, setNfcScanStep] = useState(null);
  const [nfcScanError, setNfcScanError] = useState("");
  const [highlightedTractorKoppeling, setHighlightedTractorKoppeling] =
    useState(null);
  const [highlightedWerktuigKoppeling, setHighlightedWerktuigKoppeling] =
    useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.Platform?.OS !== "web") {
      NfcManager.start();
    }
  }, []);

  const fetchCombinations = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, COMBINATIONS_COLLECTION),
        orderBy("createdAt", "desc")
      );
      const combinationsSnapshot = await getDocs(q);
      const combinationsData = combinationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCombinations(combinationsData);
    } catch (error) {
      showMessage({
        message: "Fout bij laden van combinaties",
        description: error.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTractors = async () => {
    try {
      const q = query(
        collection(db, TRACTORS_COLLECTION),
        orderBy("createdAt", "desc")
      );
      const tractorsSnapshot = await getDocs(q);
      const tractorsData = tractorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTractors(tractorsData);
    } catch (error) {
      showMessage({
        message: "Fout bij laden van tractoren",
        description: error.message,
        type: "danger",
      });
    }
  };

  const fetchEquipment = async () => {
    try {
      const q = query(
        collection(db, EQUIPMENT_COLLECTION),
        orderBy("createdAt", "desc")
      );
      const equipmentSnapshot = await getDocs(q);
      const equipmentData = equipmentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEquipment(equipmentData);
    } catch (error) {
      showMessage({
        message: "Fout bij laden van werktuigen",
        description: error.message,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    fetchCombinations();
    fetchTractors();
    fetchEquipment();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setSelectedTractorId(null);
    setSelectedEquipmentIds([]);
    setCombinationName("");
    setCombinationDescription("");
    setCurrentCombination(null);
    setEditMode(false);
    setTractorModalVisible(false); // Always close tractor modal on reset
  };

  // Open modal for adding new combination
  const handleAddCombination = () => {
    resetForm();
    setAddComboStep(0);
    setModalVisible(true);
    // DO NOT open tractor modal here
    setTractorModalVisible(false);
  };

  // Open modal for editing combination
  const handleEditCombination = (combination) => {
    setCurrentCombination(combination);
    setCombinationName(combination.name || "");
    setCombinationDescription(combination.description || "");
    setSelectedTractorId(combination.tractorId || null);
    setSelectedEquipmentIds(combination.equipmentIds || []);
    setConnectionMappings(combination.connectionMappings || {});
    setEditMode(true);
    setModalVisible(true);
    setTractorModalVisible(false); // Do not open tractor modal on edit
  };

  const handleDeleteCombination = async (combination) => {
    const result = await deleteDocument(
      COMBINATIONS_COLLECTION,
      combination.id
    );
    if (result.success) {
      setCombinations((prev) => prev.filter((c) => c.id !== combination.id));
      showMessage({ message: "Combinatie verwijderd", type: "success" });
    } else {
      showMessage({
        message: "Fout bij verwijderen",
        description: result.error.message,
        type: "danger",
      });
    }
  };

  const getTractorInfo = (tractorId) =>
    tractors.find((t) => t.id === tractorId) || null;
  const getEquipmentInfo = (equipmentId) =>
    equipment.find((e) => e.id === equipmentId) || null;
  const generateConnectionNumbers = (count) =>
    Array.from({ length: count }, (_, i) => i + 1);

  const handleConnectionMapping = (tractorConnection, werktuigConnection) => {
    if (!currentMappingEquipment) return;
    setConnectionMappings((prev) => {
      const equipmentId = currentMappingEquipment.id;
      const currentEquipmentMappings = prev[equipmentId] || {};
      const existingTractorMapping = Object.entries(
        currentEquipmentMappings
      ).find(([_, value]) => value === tractorConnection);
      const isWerktuigAlreadyMapped =
        currentEquipmentMappings[werktuigConnection];
      if (existingTractorMapping) {
        delete currentEquipmentMappings[existingTractorMapping[0]];
      }
      if (isWerktuigAlreadyMapped) {
        delete currentEquipmentMappings[werktuigConnection];
      }
      return {
        ...prev,
        [equipmentId]: {
          ...currentEquipmentMappings,
          [werktuigConnection]: tractorConnection,
        },
      };
    });
  };

  const toggleEquipmentSelection = (equipmentId) => {
    const equipmentObj = getEquipmentInfo(equipmentId);
    const tractor = getTractorInfo(selectedTractorId);
    if (!equipmentObj || !tractor) return;
    if (equipmentObj.aantalKoppelingen > tractor.aantalKoppelingen) {
      showMessage({
        message: "Te veel koppelingen benodigd",
        description: `Het werktuig heeft ${equipmentObj.aantalKoppelingen} koppelingen nodig, maar de tractor heeft er maar ${tractor.aantalKoppelingen}`,
        type: "warning",
      });
      return;
    }
    if (!selectedEquipmentIds.includes(equipmentId)) {
      setCurrentMappingEquipment(equipmentObj);
      setConnectionMappingModalVisible(true);
    }
    setSelectedEquipmentIds((prev) => {
      if (prev.includes(equipmentId)) {
        setConnectionMappings((prevMappings) => {
          const newMappings = { ...prevMappings };
          delete newMappings[equipmentId];
          return newMappings;
        });
        return prev.filter((id) => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };

  const handleSaveCombination = async () => {
    if (!combinationName) {
      showMessage({ message: "Naam is verplicht", type: "warning" });
      return;
    }
    if (!selectedTractorId) {
      showMessage({ message: "Selecteer een tractor", type: "warning" });
      return;
    }
    try {
      const combinationData = {
        name: combinationName,
        description: combinationDescription,
        tractorId: selectedTractorId,
        equipmentIds: selectedEquipmentIds,
        connectionMappings,
        updatedAt: new Date(),
      };
      if (editMode && currentCombination) {
        const combinationRef = doc(
          db,
          COMBINATIONS_COLLECTION,
          currentCombination.id
        );
        await updateDoc(combinationRef, combinationData);
        setCombinations((prev) =>
          prev.map((c) =>
            c.id === currentCombination.id ? { ...c, ...combinationData } : c
          )
        );
        showMessage({ message: "Combinatie bijgewerkt", type: "success" });
      } else {
        combinationData.createdAt = new Date();
        const newCombinationId = await generateCombinationId();
        const combinationRef = doc(
          db,
          COMBINATIONS_COLLECTION,
          newCombinationId
        );
        await setDoc(combinationRef, combinationData);
        setCombinations((prev) => [
          { id: newCombinationId, ...combinationData },
          ...prev,
        ]);
        showMessage({ message: "Combinatie toegevoegd", type: "success" });
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      showMessage({
        message: "Fout bij opslaan",
        description: error.message,
        type: "danger",
      });
    }
  };

  const handleSelectTractorForCombo = (tractorId) => {
    setSelectedTractorId(tractorId);
    setAddComboStep(1);
  };

  const handleCreateCombinationWithTractor = async () => {
    if (!selectedTractorId) {
      showMessage({ message: "Selecteer een tractor", type: "warning" });
      return;
    }
    try {
      const tractor = getTractorInfo(selectedTractorId);
      const combinationData = {
        name: tractor.name,
        tractorId: selectedTractorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const combinationRef = doc(
        db,
        COMBINATIONS_COLLECTION,
        selectedTractorId
      );
      await setDoc(combinationRef, combinationData);
      setCombinations((prev) => [
        { id: selectedTractorId, ...combinationData },
        ...prev,
      ]);
      showMessage({ message: "Combinatie aangemaakt", type: "success" });
      setModalVisible(false);
      resetForm();
    } catch (error) {
      showMessage({
        message: "Fout bij aanmaken combinatie",
        description: error.message,
        type: "danger",
      });
    }
  };

  const handleOpenSettings = (tractor) => {
    setSettingsTractor(tractor);
    setSelectedWerktuigId(null);
    setSettingsModalVisible(true); // FIX: open the correct modal
  };

  const handleOpenEye = (tractor) => {
    setEyeTractor(tractor);
    setEyeModalVisible(true);
  };

  const handleCombineWerktuig = async () => {
    if (!settingsTractor || !selectedWerktuigId) return;
    try {
      const combination = combinations.find(
        (c) => c.tractorId === settingsTractor.id
      );
      if (!combination) return;
      const prevEquipmentIds = Array.isArray(combination.equipmentIds)
        ? combination.equipmentIds
        : [];
      let newEquipmentIds = prevEquipmentIds;
      if (!prevEquipmentIds.includes(selectedWerktuigId)) {
        newEquipmentIds = [...prevEquipmentIds, selectedWerktuigId];
      }
      const updateObj = {};
      updateObj[selectedWerktuigId] = {};
      updateObj["equipmentIds"] = newEquipmentIds;
      const combinationRef = doc(db, COMBINATIONS_COLLECTION, combination.id);
      await updateDoc(combinationRef, updateObj);
      setCombinations((prev) =>
        prev.map((c) =>
          c.id === combination.id
            ? { ...c, [selectedWerktuigId]: {}, equipmentIds: newEquipmentIds }
            : c
        )
      );
      showMessage({ message: "Werktuig toegevoegd", type: "success" });
      setSettingsModalVisible(false);
    } catch (error) {
      showMessage({
        message: "Fout bij toevoegen werktuig",
        description: error.message,
        type: "danger",
      });
    }
  };

  const handleDeleteWerktuigFromCombination = async (werktuigId) => {
    const combination = combinations.find((c) => c.tractorId === eyeTractor.id);
    if (!combination) return;
    try {
      const newEquipmentIds = combination.equipmentIds.filter(
        (id) => id !== werktuigId
      );
      const updateObj = { equipmentIds: newEquipmentIds };
      const combinationRef = doc(db, COMBINATIONS_COLLECTION, combination.id);
      await updateDoc(combinationRef, updateObj);
      setCombinations((prev) =>
        prev.map((c) =>
          c.id === combination.id ? { ...c, equipmentIds: newEquipmentIds } : c
        )
      );
      showMessage({ message: "Werktuig verwijderd", type: "success" });
    } catch (error) {
      showMessage({
        message: "Fout bij verwijderen werktuig",
        description: error.message,
        type: "danger",
      });
    }
  };

  // Generate next combination ID
  const generateCombinationId = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, COMBINATIONS_COLLECTION)
      );
      let highestNumber = 0;
      querySnapshot.docs.forEach((document) => {
        const docId = document.id;
        if (docId.startsWith("combinatie-")) {
          const numberPart = docId.split("-")[1];
          const number = parseInt(numberPart);
          if (!isNaN(number) && number > highestNumber) {
            highestNumber = number;
          }
        }
      });
      return `combinatie-${highestNumber + 1}`;
    } catch (error) {
      return `combinatie-${new Date().getTime()}`;
    }
  };

  // Scan werktuig NFC and open mapping modal if found
  const handleScanWerktuigNFC = async () => {
    try {
      setNfcScanError("");
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      const tagId = tag?.id || tag?.ndefMessage?.[0]?.id || null;
      if (!tagId) throw new Error("Geen NFC tag gevonden");
      const scannedTag = tagId.toString().trim().toUpperCase();
      // Debug logging
      console.log("[NFC] Scanned werktuig tag:", scannedTag);
      equipment.forEach((e) => {
        console.log("[NFC] Werktuig:", e.name || e.id, "tag:", e.tag);
      });
      // Only check the 'tag' field (main NFC), robust to case/whitespace
      const found = equipment.find(
        (e) => e.tag && e.tag.toString().trim().toUpperCase() === scannedTag
      );
      if (found) {
        setMappingWerktuig(found);
        setKoppelingMappingModalVisible(true);
      } else {
        showMessage({
          message: "Werktuig niet gevonden",
          description: `Geen werktuig met NFC tag ${scannedTag} gevonden`,
          type: "danger",
        });
      }
    } catch (err) {
      setNfcScanError(err.message || "NFC scan mislukt");
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  // Save koppeling mapping for a werktuig
  const handleSaveKoppelingMapping = async (mapping) => {
    if (!mappingCombinationId || !mappingWerktuig) return;
    try {
      setSavingMapping(true);
      // Prepare mapping object: { tractorKoppeling: werktuigKoppeling }
      const mappingObj = {};
      Object.entries(mapping).forEach(
        ([tractorKoppeling, werktuigKoppeling]) => {
          mappingObj[tractorKoppeling] = werktuigKoppeling;
        }
      );

      // Save to Firestore under the combination document, under the werktuig id
      const combinationRef = doc(
        db,
        COMBINATIONS_COLLECTION,
        mappingCombinationId
      );
      await updateDoc(combinationRef, {
        [mappingWerktuig.id]: mappingObj,
      });

      // Update local state
      setConnectionMappings((prev) => ({
        ...prev,
        [mappingWerktuig.id]: mappingObj,
      }));

      showMessage({ message: "Koppelingen opgeslagen", type: "success" });
      setKoppelingMappingModalVisible(false);
      setMappingPairs([]);
      setRemainingTractorKoppelingen([]);
      setRemainingWerktuigKoppelingen([]);
      setHighlightedTractorKoppeling(null);
      setHighlightedWerktuigKoppeling(null);
      setNfcScanStep(null);
    } catch (error) {
      showMessage({
        message: "Fout bij opslaan koppelingen",
        description: error.message,
        type: "danger",
      });
    } finally {
      setSavingMapping(false);
    }
  };

  return {
    combinations,
    tractors,
    equipment,
    loading,
    modalVisible,
    setModalVisible,
    editMode,
    setEditMode,
    currentCombination,
    setCurrentCombination,
    selectedTractorId,
    setSelectedTractorId,
    selectedEquipmentIds,
    setSelectedEquipmentIds,
    combinationName,
    setCombinationName,
    combinationDescription,
    setCombinationDescription,
    tractorModalVisible,
    setTractorModalVisible,
    equipmentModalVisible,
    setEquipmentModalVisible,
    connectionMappingModalVisible,
    setConnectionMappingModalVisible,
    currentMappingEquipment,
    setCurrentMappingEquipment,
    connectionMappings,
    setConnectionMappings,
    addComboStep,
    setAddComboStep,
    tractorPreview,
    setTractorPreview,
    settingsModalVisible,
    setSettingsModalVisible,
    settingsTractor,
    setSettingsTractor,
    selectedWerktuigId,
    setSelectedWerktuigId,
    eyeModalVisible,
    setEyeModalVisible,
    eyeTractor,
    setEyeTractor,
    koppelingMappingModalVisible,
    setKoppelingMappingModalVisible,
    mappingWerktuig,
    setMappingWerktuig,
    mappingTractor,
    setMappingTractor,
    mappingPairs,
    setMappingPairs,
    remainingWerktuigKoppelingen,
    setRemainingWerktuigKoppelingen,
    remainingTractorKoppelingen,
    setRemainingTractorKoppelingen,
    savingMapping,
    setSavingMapping,
    mappingCombinationId,
    setMappingCombinationId,
    koppelingMappingError,
    setKoppelingMappingError,
    nfcScanStep,
    setNfcScanStep,
    nfcScanError,
    setNfcScanError,
    highlightedTractorKoppeling,
    setHighlightedTractorKoppeling,
    highlightedWerktuigKoppeling,
    setHighlightedWerktuigKoppeling,
    fetchCombinations,
    fetchTractors,
    fetchEquipment,
    resetForm,
    generateCombinationId,
    handleAddCombination,
    handleEditCombination,
    handleDeleteCombination,
    getTractorInfo,
    getEquipmentInfo,
    generateConnectionNumbers,
    handleConnectionMapping,
    toggleEquipmentSelection,
    handleSaveCombination,
    handleSelectTractorForCombo,
    handleCreateCombinationWithTractor,
    handleOpenSettings,
    handleOpenEye,
    handleCombineWerktuig,
    handleDeleteWerktuigFromCombination,
    handleScanWerktuigNFC,
    handleSaveKoppelingMapping,
  };
}
