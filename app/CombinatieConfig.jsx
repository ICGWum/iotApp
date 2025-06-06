import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import styles from "./styles/combinatie";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, deleteDocument } from "./Firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  FieldValue,
  deleteField,
} from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

const COMBINATIONS_COLLECTION = "combinations";
const TRACTORS_COLLECTION = "tractors";
const EQUIPMENT_COLLECTION = "equipment";

export default function CombinatieConfig() {
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

  // --- New state for add combination flow ---
  const [addComboStep, setAddComboStep] = useState(0); // 0: select tractor, 1: confirm

  // Add state for tractor preview
  const [tractorPreview, setTractorPreview] = useState(null);

  // --- Settings Modal State ---
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsTractor, setSettingsTractor] = useState(null);
  const [selectedWerktuigId, setSelectedWerktuigId] = useState(null);

  // --- Eye Modal State ---
  const [eyeModalVisible, setEyeModalVisible] = useState(false);
  const [eyeTractor, setEyeTractor] = useState(null);

  // --- Koppeling Mapping Modal State ---
  const [koppelingMappingModalVisible, setKoppelingMappingModalVisible] =
    useState(false);
  const [mappingWerktuig, setMappingWerktuig] = useState(null); // werktuig object
  const [mappingTractor, setMappingTractor] = useState(null); // tractor object
  const [mappingPairs, setMappingPairs] = useState([]); // [{tractor: 3, werktuig: 1}, ...]
  const [remainingWerktuigKoppelingen, setRemainingWerktuigKoppelingen] =
    useState([]); // [1,2,3,...]
  const [remainingTractorKoppelingen, setRemainingTractorKoppelingen] =
    useState([]); // [1,2,3,...]
  const [savingMapping, setSavingMapping] = useState(false); // ADDED
  const [mappingCombinationId, setMappingCombinationId] = useState(null); // for db update

  // New state for koppeling mapping error
  const [koppelingMappingError, setKoppelingMappingError] = useState("");

  // --- NFC SCAN STATE ---
  const [nfcScanStep, setNfcScanStep] = useState(null); // null | { tractor: null|string, werktuig: null|string }
  const [nfcScanError, setNfcScanError] = useState("");
  const [highlightedTractorKoppeling, setHighlightedTractorKoppeling] =
    useState(null);
  const [highlightedWerktuigKoppeling, setHighlightedWerktuigKoppeling] =
    useState(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      NfcManager.start();
    }
  }, []);

  // Fetch all combinations
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
      console.error("Error fetching combinations:", error);
      showMessage({
        message: "Fout bij laden van combinaties",
        description: error.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tractors
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
      console.error("Error fetching tractors:", error);
      showMessage({
        message: "Fout bij laden van tractoren",
        description: error.message,
        type: "danger",
      });
    }
  };

  // Fetch equipment
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
      console.error("Error fetching equipment:", error);
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

  useEffect(() => {
    if (!navigation) return;
  }, [navigation]);

  // Reset form fields
  const resetForm = () => {
    setSelectedTractorId(null);
    setSelectedEquipmentIds([]);
    setCombinationName("");
    setCombinationDescription("");
    setCurrentCombination(null);
    setEditMode(false);
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
      console.error("Error generating combination ID:", error);
      return `combinatie-${new Date().getTime()}`;
    }
  };

  // Open modal for adding new combination
  const handleAddCombination = () => {
    resetForm();
    setAddComboStep(0);
    setModalVisible(true);
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
  };

  const handleDeleteCombination = async (combination) => {
    const result = await deleteDocument(
      COMBINATIONS_COLLECTION,
      combination.id
    );
    if (result.success) {
      setCombinations((prev) => prev.filter((c) => c.id !== combination.id));
      showMessage({
        message: "Combinatie verwijderd",
        type: "success",
      });
    } else {
      showMessage({
        message: "Fout bij verwijderen",
        description: result.error.message,
        type: "danger",
      });
    }
  };

  // Get tractor info
  const getTractorInfo = (tractorId) => {
    const tractor = tractors.find((t) => t.id === tractorId);
    return tractor || null;
  };

  // Get equipment info
  const getEquipmentInfo = (equipmentId) => {
    const equip = equipment.find((e) => e.id === equipmentId);
    return equip || null;
  };

  // Add helper function to generate connection arrays
  const generateConnectionNumbers = (count) => {
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  // Add function to handle connection mapping
  const handleConnectionMapping = (tractorConnection, werktuigConnection) => {
    if (!currentMappingEquipment) return;

    setConnectionMappings((prev) => {
      const equipmentId = currentMappingEquipment.id;
      const currentEquipmentMappings = prev[equipmentId] || {};

      // Check if this tractor connection is already mapped to another werktuig connection
      const existingTractorMapping = Object.entries(
        currentEquipmentMappings
      ).find(([_, value]) => value === tractorConnection);

      // Check if this werktuig connection is already mapped to another tractor connection
      const isWerktuigAlreadyMapped =
        currentEquipmentMappings[werktuigConnection];

      // If either connection is already mapped, remove the existing mapping
      if (existingTractorMapping) {
        delete currentEquipmentMappings[existingTractorMapping[0]];
      }
      if (isWerktuigAlreadyMapped) {
        delete currentEquipmentMappings[werktuigConnection];
      }

      // Add the new mapping
      return {
        ...prev,
        [equipmentId]: {
          ...currentEquipmentMappings,
          [werktuigConnection]: tractorConnection,
        },
      };
    });
  };

  // Modify the toggleEquipmentSelection function
  const toggleEquipmentSelection = (equipmentId) => {
    const equipment = getEquipmentInfo(equipmentId);
    const tractor = getTractorInfo(selectedTractorId);

    if (!equipment || !tractor) return;

    // Check if the werktuig doesn't require more connections than the tractor has
    if (equipment.aantalKoppelingen > tractor.aantalKoppelingen) {
      showMessage({
        message: "Te veel koppelingen benodigd",
        description: `Het werktuig heeft ${equipment.aantalKoppelingen} koppelingen nodig, maar de tractor heeft er maar ${tractor.aantalKoppelingen}`,
        type: "warning",
      });
      return;
    }

    if (!selectedEquipmentIds.includes(equipmentId)) {
      // When adding new equipment, show the mapping modal
      setCurrentMappingEquipment(equipment);
      setConnectionMappingModalVisible(true);
    }

    setSelectedEquipmentIds((prev) => {
      if (prev.includes(equipmentId)) {
        // When removing equipment, clear its mappings
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

  // Validate and save combination
  const handleSaveCombination = async () => {
    // Validate inputs
    if (!combinationName) {
      showMessage({
        message: "Naam is verplicht",
        type: "warning",
      });
      return;
    }

    if (!selectedTractorId) {
      showMessage({
        message: "Selecteer een tractor",
        type: "warning",
      });
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
        // Update existing combination
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

        showMessage({
          message: "Combinatie bijgewerkt",
          type: "success",
        });
      } else {
        // Add new combination
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

        showMessage({
          message: "Combinatie toegevoegd",
          type: "success",
        });
      }

      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error saving combination:", error);
      showMessage({
        message: "Fout bij opslaan",
        description: error.message,
        type: "danger",
      });
    }
  };

  // New handler for selecting tractor in add flow
  const handleSelectTractorForCombo = (tractorId) => {
    setSelectedTractorId(tractorId);
    setAddComboStep(1);
  };

  // New handler for creating combination with tractorId as doc id
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

  // Render combination item
  const renderCombinationItem = ({ item }) => {
    const tractor = getTractorInfo(item.tractorId);
    if (!tractor) return null;
    return (
      <View
        style={[
          styles.combinationItem,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {tractor.imageUri ? (
            <Image
              source={{ uri: tractor.imageUri }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                marginRight: 16,
                backgroundColor: "#eee",
              }}
              resizeMode="contain"
            />
          ) : (
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                backgroundColor: "#eee",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Text>Geen</Text>
            </View>
          )}
          <View>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              {tractor.name}
            </Text>
            <Text style={{ color: "#666", fontSize: 15 }}>
              {tractor.brand} {tractor.model}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleOpenEye(tractor)}>
          <Text style={{ fontSize: 28, marginLeft: 8, marginRight: 4 }}>
            👁️
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOpenSettings(tractor)}>
          <Text style={{ fontSize: 32, marginLeft: 4 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Place this above the main return statement
  const renderEquipmentItem = ({ item }) => {
    const tractor = getTractorInfo(selectedTractorId);
    const isCompatible =
      tractor && item.aantalKoppelingen <= tractor.aantalKoppelingen;
    const incompatibleStyle = !isCompatible ? { opacity: 0.5 } : {};

    return (
      <TouchableOpacity
        style={[
          styles.selectionItem,
          selectedEquipmentIds.includes(item.id) && styles.selectedItem,
          incompatibleStyle,
        ]}
        onPress={() => toggleEquipmentSelection(item.id)}
      >
        <View style={styles.selectionItemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text>Type: {item.type}</Text>
          {item.brand && <Text>Merk: {item.brand}</Text>}
          <Text>Aantal koppelingen: {item.aantalKoppelingen}</Text>
          {!isCompatible && tractor && (
            <Text style={styles.warningText}>
              Niet compatibel - Werktuig heeft {item.aantalKoppelingen}{" "}
              koppelingen nodig, tractor heeft er {tractor.aantalKoppelingen}
            </Text>
          )}
        </View>
        <View style={styles.checkboxContainer}>
          <View
            style={[
              styles.checkbox,
              selectedEquipmentIds.includes(item.id) && styles.checkboxSelected,
            ]}
          >
            {selectedEquipmentIds.includes(item.id) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Open Settings Modal
  const handleOpenSettings = (tractor) => {
    setSettingsTractor(tractor);
    setSelectedWerktuigId(null);
    setSettingsModalVisible(true);
  };

  // --- Open Eye Modal ---
  const handleOpenEye = (tractor) => {
    setEyeTractor(tractor);
    setEyeModalVisible(true);
  };

  // --- Open Koppeling Mapping Modal ---
  const handleOpenKoppelingMapping = (werktuig, tractor, combinationId) => {
    // Enforce correct logic
    if (
      !tractor.aantalKoppelingen ||
      !werktuig.aantalKoppelingen ||
      tractor.aantalKoppelingen < werktuig.aantalKoppelingen
    ) {
      let errorMsg = "";
      if (!tractor.aantalKoppelingen || !werktuig.aantalKoppelingen) {
        errorMsg =
          "Aantal koppelingen van tractor en werktuig moeten beide groter dan 0 zijn.";
      } else if (tractor.aantalKoppelingen < werktuig.aantalKoppelingen) {
        errorMsg =
          "Het aantal tractor koppelingen moet groter of gelijk zijn aan het aantal werktuig koppelingen.";
      }
      setKoppelingMappingError(errorMsg);
      setKoppelingMappingModalVisible(true);
      return;
    }
    setMappingWerktuig(werktuig);
    setMappingTractor(tractor);
    setMappingCombinationId(combinationId);
    setMappingPairs([]);
    setRemainingWerktuigKoppelingen(
      Array.from({ length: werktuig.aantalKoppelingen }, (_, i) => i + 1)
    );
    setRemainingTractorKoppelingen(
      Array.from({ length: tractor.aantalKoppelingen }, (_, i) => i + 1)
    );
    setKoppelingMappingError("");
    setKoppelingMappingModalVisible(true);
  };

  // --- Render Koppeling Mapping Modal ---
  const renderKoppelingMappingModal = () => {
    if (koppelingMappingError) {
      return (
        <Modal
          visible={koppelingMappingModalVisible}
          transparent
          animationType="slide"
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 32,
                width: 340,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  marginBottom: 16,
                }}
              >
                Ongeldige koppeling selectie
              </Text>
              <Text style={{ textAlign: "center", marginBottom: 24 }}>
                {koppelingMappingError}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#888",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                }}
                onPress={() => {
                  setKoppelingMappingModalVisible(false);
                  setKoppelingMappingError("");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Sluiten
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    }
    if (!mappingTractor || !mappingWerktuig) return null;
    const allTractorKoppelingen = Array.from(
      { length: mappingTractor.aantalKoppelingen },
      (_, i) => i + 1
    );
    const allWerktuigKoppelingen = Array.from(
      { length: mappingWerktuig.aantalKoppelingen },
      (_, i) => i + 1
    );
    // Sort mappingPairs by tractor koppeling
    const connectedPairs = [...mappingPairs].sort(
      (a, b) => a.tractor - b.tractor
    );
    if (mappingWerktuig.aantalKoppelingen > mappingTractor.aantalKoppelingen) {
      return (
        <Modal
          visible={koppelingMappingModalVisible}
          transparent
          animationType="slide"
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 32,
                width: 340,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  marginBottom: 16,
                }}
              >
                Te veel werktuig koppelingen
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                Dit werktuig heeft meer koppelingen dan de tractor. Kies een
                ander werktuig of tractor.
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#888",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                }}
                onPress={() => setKoppelingMappingModalVisible(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Sluiten
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    }
    return (
      <Modal
        visible={koppelingMappingModalVisible}
        transparent
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              width: 370,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 20,
                marginBottom: 18,
                textAlign: "center",
              }}
            >
              Koppelingen scannen (Testscan demo)
            </Text>
            <Text
              style={{
                color: "#666",
                marginBottom: 22,
                textAlign: "center",
                fontSize: 16,
              }}
            >
              {mappingTractor.name} ↔ {mappingWerktuig.name}
            </Text>
            {/* Swapped column titles: Tractor left, Werktuig right */}
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                marginBottom: 0,
              }}
            >
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  Tractor
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }} />
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  Werktuig
                </Text>
              </View>
            </View>
            {/* Koppelingen rows, swapped: Tractor left, Werktuig right */}
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                minHeight: 180,
                marginBottom: 18,
              }}
            >
              {/* Tractor koppelingen */}
              <View style={{ flex: 1, alignItems: "center" }}>
                {allTractorKoppelingen.map((num) => {
                  const isPaired = connectedPairs.some(
                    (p) => p.tractor === num
                  );
                  return (
                    <View
                      key={num}
                      style={{
                        backgroundColor: isPaired ? "#4caf50" : "#eee",
                        borderRadius: 8,
                        marginVertical: 4,
                        width: 38,
                        height: 38,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: isPaired ? "#fff" : "#333",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {num}
                      </Text>
                    </View>
                  );
                })}
              </View>
              {/* Center: show mapping pairs, sorted by tractor koppeling */}
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 120,
                }}
              >
                {connectedPairs.length === 0 ? (
                  <Text
                    style={{
                      color: "#aaa",
                      fontSize: 13,
                      marginTop: 16,
                      textAlign: "center",
                    }}
                  >
                    Nog geen koppelingen
                  </Text>
                ) : (
                  connectedPairs.map((pair, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "#4caf50",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                      >
                        Tractor {pair.tractor}
                      </Text>
                      <Text
                        style={{
                          marginHorizontal: 6,
                          color: "#333",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                      >
                        ↔
                      </Text>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "#4caf50",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                      >
                        Werktuig {pair.werktuig}
                      </Text>
                    </View>
                  ))
                )}
              </View>
              {/* Werktuig koppelingen */}
              <View style={{ flex: 1, alignItems: "center" }}>
                {allWerktuigKoppelingen.map((num) => {
                  const isPaired = connectedPairs.some(
                    (p) => p.werktuig === num
                  );
                  return (
                    <View
                      key={num}
                      style={{
                        backgroundColor: isPaired ? "#4caf50" : "#eee",
                        borderRadius: 8,
                        marginVertical: 4,
                        width: 38,
                        height: 38,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: isPaired ? "#fff" : "#333",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {num}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            {/* Vertically stacked buttons */}
            <View style={{ width: "100%", marginTop: 18 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#4caf50",
                  borderRadius: 8,
                  paddingVertical: 14,
                  marginBottom: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={async () => {
                  setNfcScanError("");
                  try {
                    // Step 1: Scan tractor NFC tag
                    setNfcScanStep({ tractor: null, werktuig: null });
                    await NfcManager.requestTechnology(NfcTech.Ndef, {
                      alertMessage: "Scan een tractor NFC tag",
                    });
                    const tractorTag = await NfcManager.getTag();
                    await NfcManager.cancelTechnologyRequest();
                    if (!tractorTag || !tractorTag.id) {
                      setNfcScanError("Geen geldige tractor NFC tag gevonden.");
                      setNfcScanStep(null);
                      return;
                    }
                    // Find tractor koppeling number by matching tag.id in mappingTractor.tags
                    let tractorKoppelingNum = null;
                    if (mappingTractor && mappingTractor.tags) {
                      for (const [koppelingNum, tagId] of Object.entries(
                        mappingTractor.tags
                      )) {
                        if (tagId === tractorTag.id) {
                          tractorKoppelingNum = parseInt(koppelingNum);
                          break;
                        }
                      }
                    }
                    if (!tractorKoppelingNum) {
                      setNfcScanError(
                        "Deze tractor NFC tag is niet gekoppeld aan een koppeling."
                      );
                      setNfcScanStep(null);
                      return;
                    }
                    setHighlightedTractorKoppeling(tractorKoppelingNum);
                    setNfcScanStep({ tractor: tractorTag.id, werktuig: null });

                    // Step 2: Scan werktuig NFC tag
                    await NfcManager.requestTechnology(NfcTech.Ndef, {
                      alertMessage: "Scan een werktuig NFC tag",
                    });
                    const werktuigTag = await NfcManager.getTag();
                    await NfcManager.cancelTechnologyRequest();
                    if (!werktuigTag || !werktuigTag.id) {
                      setNfcScanError(
                        "Geen geldige werktuig NFC tag gevonden."
                      );
                      setNfcScanStep(null);
                      setHighlightedTractorKoppeling(null);
                      return;
                    }
                    // Find werktuig koppeling number by matching tag.id in mappingWerktuig.tags
                    let werktuigKoppelingNum = null;
                    if (mappingWerktuig && mappingWerktuig.tags) {
                      for (const [koppelingNum, tagId] of Object.entries(
                        mappingWerktuig.tags
                      )) {
                        if (tagId === werktuigTag.id) {
                          werktuigKoppelingNum = parseInt(koppelingNum);
                          break;
                        }
                      }
                    }
                    if (!werktuigKoppelingNum) {
                      setNfcScanError(
                        "Deze werktuig NFC tag is niet gekoppeld aan een koppeling."
                      );
                      setNfcScanStep(null);
                      setHighlightedTractorKoppeling(null);
                      return;
                    }
                    setHighlightedWerktuigKoppeling(werktuigKoppelingNum);
                    setNfcScanStep({
                      tractor: tractorTag.id,
                      werktuig: werktuigTag.id,
                    });

                    // Check if tag IDs match (combination requirement)
                    if (tractorTag.id !== werktuigTag.id) {
                      setNfcScanError(
                        "De NFC tags komen niet overeen. Scan dezelfde tag op tractor en werktuig."
                      );
                      setNfcScanStep(null);
                      setHighlightedTractorKoppeling(null);
                      setHighlightedWerktuigKoppeling(null);
                      return;
                    }

                    // Check if this pair is already combined
                    const alreadyCombined = mappingPairs.some(
                      (p) =>
                        p.tractor === tractorKoppelingNum ||
                        p.werktuig === werktuigKoppelingNum
                    );
                    if (alreadyCombined) {
                      setNfcScanError("Deze koppeling is al gecombineerd.");
                      setNfcScanStep(null);
                      setHighlightedTractorKoppeling(null);
                      setHighlightedWerktuigKoppeling(null);
                      return;
                    }
                    // Add to mappingPairs
                    setMappingPairs((prev) => [
                      ...prev,
                      {
                        tractor: tractorKoppelingNum,
                        werktuig: werktuigKoppelingNum,
                      },
                    ]);
                    // Remove from remaining lists
                    setRemainingTractorKoppelingen((prev) =>
                      prev.filter((n) => n !== tractorKoppelingNum)
                    );
                    setRemainingWerktuigKoppelingen((prev) =>
                      prev.filter((n) => n !== werktuigKoppelingNum)
                    );
                    // Reset highlights after a short delay
                    setTimeout(() => {
                      setHighlightedTractorKoppeling(null);
                      setHighlightedWerktuigKoppeling(null);
                      setNfcScanStep(null);
                    }, 1200);
                  } catch (e) {
                    setNfcScanError("NFC scan geannuleerd of mislukt.");
                    setNfcScanStep(null);
                    setHighlightedTractorKoppeling(null);
                    setHighlightedWerktuigKoppeling(null);
                    NfcManager.cancelTechnologyRequest().catch(() => {});
                  }
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  Scan Koppeling
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#e53935", // red
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setKoppelingMappingModalVisible(false)}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Annuleren
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      remainingWerktuigKoppelingen.length === 0
                        ? "#4caf50"
                        : "#b7e1c6",
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={handleSaveKoppelingMapping}
                  disabled={
                    remainingWerktuigKoppelingen.length !== 0 || savingMapping
                  }
                >
                  <Text
                    style={{
                      color:
                        remainingWerktuigKoppelingen.length === 0
                          ? "#fff"
                          : "#666",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Opslaan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render connection mapping modal for old mapping UI (if still used)
  const renderConnectionMappingModal = () => {
    if (!currentMappingEquipment || !selectedTractorId) return null;
    const tractor = getTractorInfo(selectedTractorId);
    const tractorConnections = generateConnectionNumbers(
      tractor.aantalKoppelingen
    );
    const werktuigConnections = generateConnectionNumbers(
      currentMappingEquipment.aantalKoppelingen
    );
    const currentMappings =
      connectionMappings[currentMappingEquipment.id] || {};

    return (
      <Modal
        visible={connectionMappingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConnectionMappingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.mappingHeaderContainer}>
              <Text style={styles.modalTitle}>Koppel de aansluitingen</Text>
              <Text style={styles.subtitle}>
                {currentMappingEquipment.name} - {tractor.name}
              </Text>
              <View style={styles.mappingLegend}>
                <View style={styles.legendItem}>
                  <View style={styles.legendDot} />
                  <Text>Niet gekoppeld</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#2196F3" }]}
                  />
                  <Text>Gekoppeld</Text>
                </View>
              </View>
            </View>
            <ScrollView
              style={styles.mappingContainer}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.mappingContentContainer}
            >
              {werktuigConnections.map((werktuigConn) => {
                const mappedTractorConn = currentMappings[werktuigConn];
                return (
                  <View key={werktuigConn} style={styles.mappingRow}>
                    <View style={styles.mappingWerktuig}>
                      <Text style={styles.mappingLabel}>Werktuig</Text>
                      <View
                        style={[
                          styles.connectionBadge,
                          mappedTractorConn && styles.connectionBadgeMapped,
                        ]}
                      >
                        <Text
                          style={[
                            styles.connectionNumber,
                            mappedTractorConn && styles.connectionNumberMapped,
                          ]}
                        >
                          {werktuigConn}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.mappingArrowContainer}>
                      <Text style={styles.mappingArrow}>←→</Text>
                    </View>
                    <View style={styles.mappingTractor}>
                      <Text style={styles.mappingLabel}>Tractor</Text>
                      <View style={styles.tractorConnectionsGrid}>
                        {tractorConnections.map((tractorConn) => (
                          <TouchableOpacity
                            key={tractorConn}
                            style={[
                              styles.tractorConnectionButton,
                              currentMappings[werktuigConn] === tractorConn &&
                                styles.tractorConnectionButtonSelected,
                              Object.values(currentMappings).includes(
                                tractorConn
                              ) &&
                                currentMappings[werktuigConn] !== tractorConn &&
                                styles.tractorConnectionButtonUsed,
                            ]}
                            onPress={() =>
                              handleConnectionMapping(tractorConn, werktuigConn)
                            }
                          >
                            <Text
                              style={[
                                styles.tractorConnectionNumber,
                                currentMappings[werktuigConn] === tractorConn &&
                                  styles.tractorConnectionNumberSelected,
                              ]}
                            >
                              {tractorConn}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setConnectionMappingModalVisible(false)}
              >
                <Text style={styles.buttonText}>Gereed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // --- Modified Add Combination Modal ---
  const renderAddCombinationModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nieuwe combinatie toevoegen</Text>
          <TouchableOpacity
            style={[
              styles.modalButton,
              styles.saveButton,
              { marginBottom: 20 },
            ]}
            onPress={() => setTractorModalVisible(true)}
          >
            <Text style={styles.buttonText}>Selecteer een tractor</Text>
          </TouchableOpacity>
          {tractorPreview && (
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              {tractorPreview.imageUri ? (
                <Image
                  source={{ uri: tractorPreview.imageUri }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    backgroundColor: "#eee",
                  }}
                  resizeMode="contain"
                  onError={(e) => {
                    console.log(
                      "Image load error",
                      e.nativeEvent.error,
                      tractorPreview.imageUri
                    );
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    backgroundColor: "#eee",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Geen afbeelding</Text>
                </View>
              )}
              <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
                {tractorPreview.name}
              </Text>
            </View>
          )}
          {tractorPreview && (
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                { marginBottom: 10 },
              ]}
              onPress={async () => {
                try {
                  const combinationData = {
                    name: tractorPreview.name,
                    tractorId: tractorPreview.id,
                    imageUri: tractorPreview.imageUri || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  const combinationRef = doc(
                    db,
                    COMBINATIONS_COLLECTION,
                    tractorPreview.id
                  );
                  await setDoc(combinationRef, combinationData);
                  setCombinations((prev) => [
                    { id: tractorPreview.id, ...combinationData },
                    ...prev,
                  ]);
                  showMessage({
                    message: "Combinatie aangemaakt",
                    type: "success",
                  });
                  setModalVisible(false);
                  setTractorPreview(null);
                  resetForm();
                } catch (error) {
                  showMessage({
                    message: "Fout bij aanmaken combinatie",
                    description: error.message,
                    type: "danger",
                  });
                }
              }}
            >
              <Text style={styles.buttonText}>Aanmaken</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Annuleren</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // --- Modified Tractor Selection Modal ---
  const renderTractorSelectionModal = () => (
    <Modal
      visible={tractorModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setTractorModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecteer een tractor</Text>
          {tractors.length === 0 ? (
            <View style={styles.emptySelectionList}>
              <Text>Geen tractoren beschikbaar</Text>
              <Text>Voeg eerst tractoren toe in tractorbeheer</Text>
            </View>
          ) : (
            <FlatList
              data={tractors}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectionItem}
                  onPress={() => {
                    setTractorPreview(item);
                    setSelectedTractorId(item.id);
                    setTractorModalVisible(false);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 12,
                          marginRight: 16,
                          backgroundColor: "#eee",
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 12,
                          backgroundColor: "#eee",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Text>Geen</Text>
                      </View>
                    )}
                    <View>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 14 }}>
                        {item.brand} {item.model}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              style={styles.selectionList}
            />
          )}
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setTractorModalVisible(false)}
          >
            <Text style={styles.buttonText}>Sluiten</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // --- Render Settings Modal ---
  const renderSettingsModal = () => {
    if (!settingsTractor) return null;
    // Only show werktuigen that fit the koppeling logic
    const compatibleWerktuigen = equipment.filter(
      (w) =>
        w.aantalKoppelingen <= settingsTractor.aantalKoppelingen &&
        w.id &&
        w.name
    );
    return (
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Werktuig koppelen aan {settingsTractor.name}
            </Text>
            <FlatList
              data={compatibleWerktuigen}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.selectionItem,
                    selectedWerktuigId === item.id && styles.selectedItem,
                  ]}
                  onPress={() => setSelectedWerktuigId(item.id)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          marginRight: 16,
                          backgroundColor: "#eee",
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          backgroundColor: "#eee",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Text>Geen</Text>
                      </View>
                    )}
                    <View>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 14 }}>
                        {item.type}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300, marginBottom: 16 }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { marginRight: 8 },
                ]}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  { opacity: selectedWerktuigId ? 1 : 0.5 },
                ]}
                disabled={!selectedWerktuigId}
                onPress={handleCombineWerktuig}
              >
                <Text style={styles.buttonText}>Combineer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Add Werktuig to Combination
  const handleCombineWerktuig = async () => {
    if (!settingsTractor || !selectedWerktuigId) return;
    try {
      // Find combination for this tractor
      const combination = combinations.find(
        (c) => c.tractorId === settingsTractor.id
      );
      if (!combination) {
        showMessage({ message: "Geen combinatie gevonden", type: "danger" });
        return;
      }
      // Update equipmentIds array (add if not present)
      const prevEquipmentIds = Array.isArray(combination.equipmentIds)
        ? combination.equipmentIds
        : [];
      let newEquipmentIds = prevEquipmentIds;
      if (!prevEquipmentIds.includes(selectedWerktuigId)) {
        newEquipmentIds = [...prevEquipmentIds, selectedWerktuigId];
      }
      // Add werktuig as empty mapping at the root of the combination document
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

  // --- Render Eye Modal ---
  const renderEyeModal = () => {
    if (!eyeModalVisible || !eyeTractor) return null;
    // Find the combination for this tractor
    const combination = combinations.find((c) => c.tractorId === eyeTractor.id);
    // Get all gekoppelde werktuigen (equipment IDs)
    const gekoppeldeWerktuigen =
      combination && combination.equipmentIds ? combination.equipmentIds : [];

    // Handler to delete werktuig from combination (no confirmation)
    const handleDeleteWerktuigFromCombination = async (werktuigId) => {
      if (!combination) return;
      try {
        // Remove from equipmentIds
        const newEquipmentIds = (combination.equipmentIds || []).filter(
          (id) => id !== werktuigId
        );
        // Remove mapping field using Firestore deleteField()
        const updateObj = { equipmentIds: newEquipmentIds };
        updateObj[werktuigId] = deleteField();
        const combinationRef = doc(db, COMBINATIONS_COLLECTION, combination.id);
        await updateDoc(combinationRef, updateObj);
        // Refetch combinations to ensure UI is in sync with Firestore
        fetchCombinations();
        showMessage({
          message: "Werktuig verwijderd uit combinatie",
          type: "success",
        });
      } catch (error) {
        showMessage({
          message: "Fout bij verwijderen werktuig",
          description: error.message,
          type: "danger",
        });
      }
    };

    return (
      <Modal
        visible={eyeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEyeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Gekoppelde werktuigen voor {eyeTractor.name}
            </Text>
            {gekoppeldeWerktuigen.length === 0 ? (
              <View style={styles.emptySelectionList}>
                <Text>Geen gekoppelde werktuigen</Text>
              </View>
            ) : (
              <FlatList
                data={gekoppeldeWerktuigen}
                keyExtractor={(id) => id}
                renderItem={({ item }) => {
                  const werktuig = getEquipmentInfo(item);
                  if (!werktuig) return null;
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 14,
                        backgroundColor: "#f7f7f7",
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      {werktuig.imageUri ? (
                        <Image
                          source={{ uri: werktuig.imageUri }}
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 8,
                            marginRight: 14,
                            backgroundColor: "#eee",
                          }}
                          resizeMode="contain"
                        />
                      ) : (
                        <View
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 8,
                            backgroundColor: "#eee",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 14,
                          }}
                        >
                          <Text>Geen</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                          {werktuig.name}
                        </Text>
                        <Text style={{ color: "#666", fontSize: 14 }}>
                          Type: {werktuig.type}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          // Open koppeling mapping modal for this werktuig
                          handleOpenKoppelingMapping(
                            werktuig,
                            eyeTractor,
                            combination.id
                          );
                          setEyeModalVisible(false);
                        }}
                      >
                        <Text style={{ fontSize: 22, marginLeft: 8 }}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteWerktuigFromCombination(item)
                        }
                        style={{ marginLeft: 8 }}
                      >
                        <Text style={{ fontSize: 22, color: "#e53935" }}>
                          🗑️
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
                style={{ marginBottom: 18, marginTop: 8 }}
              />
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setEyeModalVisible(false)}
            >
              <Text style={styles.buttonText}>Sluiten</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading && combinations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Combinaties laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Combinatiebeheer</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCombination}
        >
          <Text style={styles.buttonText}>+ Combinatie toevoegen</Text>
        </TouchableOpacity>
      </View>

      {combinations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Geen combinaties gevonden</Text>
          <Text>Voeg je eerste combinatie toe met de knop hierboven</Text>
        </View>
      ) : (
        <FlatList
          data={combinations}
          renderItem={renderCombinationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={true}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      {/* Add/Edit Combination Modal */}
      {renderAddCombinationModal()}

      {/* Tractor Selection Modal */}
      {renderTractorSelectionModal()}

      {/* Equipment Selection Modal */}
      <Modal
        visible={equipmentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEquipmentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecteer werktuigen</Text>

            {equipment.length === 0 ? (
              <View style={styles.emptySelectionList}>
                <Text>Geen werktuigen beschikbaar</Text>
                <Text>Voeg eerst werktuigen toe in werktuigbeheer</Text>
              </View>
            ) : (
              <FlatList
                data={equipment}
                renderItem={renderEquipmentItem}
                keyExtractor={(item) => item.id}
                style={styles.selectionList}
              />
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setEquipmentModalVisible(false)}
            >
              <Text style={styles.buttonText}>Gereed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderConnectionMappingModal()}

      {/* Settings Modal */}
      {renderSettingsModal()}

      {/* Eye Modal */}
      {renderEyeModal()}

      {renderKoppelingMappingModal()}
    </View>
  );
}

// --- NFC MOCK SCAN LOGIC FOR KOPPELING MAPPING MODAL ---
// Simulate NFC scan for tractor or werktuig koppeling
const mockNfcScan = async (type, max, used) => {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Pick a random available koppeling number
  const all = Array.from({ length: max }, (_, i) => i + 1);
  const available = all.filter((n) => !used.includes(n));
  if (available.length === 0) return null;
  // For demo, pick the first available
  return available[0];
};

// --- Add koppeling pair handler for mapping modal ---
const handleAddKoppelingPair = () => {
  if (pendingTractorKoppeling && pendingWerktuigKoppeling) {
    setMappingPairs((prev) => [
      ...prev,
      { tractor: pendingTractorKoppeling, werktuig: pendingWerktuigKoppeling },
    ]);
    setPendingTractorKoppeling(null);
    setPendingWerktuigKoppeling(null);
  }
};

// --- Save Koppeling Mapping (stub, no-op for now) ---
// Removed duplicate handleSaveKoppelingMapping to resolve redeclaration error.

// --- NFC SCAN HANDLER ---
const handleScanKoppeling = async () => {
  setNfcScanError("");
  try {
    // Step 1: Scan tractor NFC tag
    setNfcScanStep({ tractor: null, werktuig: null });
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: "Scan een tractor NFC tag",
    });
    const tractorTag = await NfcManager.getTag();
    await NfcManager.cancelTechnologyRequest();
    if (!tractorTag || !tractorTag.id) {
      setNfcScanError("Geen geldige tractor NFC tag gevonden.");
      setNfcScanStep(null);
      return;
    }
    // Find tractor koppeling number by matching tag.id in mappingTractor.tags
    let tractorKoppelingNum = null;
    if (mappingTractor && mappingTractor.tags) {
      for (const [koppelingNum, tagId] of Object.entries(mappingTractor.tags)) {
        if (tagId === tractorTag.id) {
          tractorKoppelingNum = parseInt(koppelingNum);
          break;
        }
      }
    }
    if (!tractorKoppelingNum) {
      setNfcScanError(
        "Deze tractor NFC tag is niet gekoppeld aan een koppeling."
      );
      setNfcScanStep(null);
      return;
    }
    setHighlightedTractorKoppeling(tractorKoppelingNum);
    setNfcScanStep({ tractor: tractorTag.id, werktuig: null });

    // Step 2: Scan werktuig NFC tag
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: "Scan een werktuig NFC tag",
    });
    const werktuigTag = await NfcManager.getTag();
    await NfcManager.cancelTechnologyRequest();
    if (!werktuigTag || !werktuigTag.id) {
      setNfcScanError("Geen geldige werktuig NFC tag gevonden.");
      setNfcScanStep(null);
      setHighlightedTractorKoppeling(null);
      return;
    }
    // Find werktuig koppeling number by matching tag.id in mappingWerktuig.tags
    let werktuigKoppelingNum = null;
    if (mappingWerktuig && mappingWerktuig.tags) {
      for (const [koppelingNum, tagId] of Object.entries(
        mappingWerktuig.tags
      )) {
        if (tagId === werktuigTag.id) {
          werktuigKoppelingNum = parseInt(koppelingNum);
          break;
        }
      }
    }
    if (!werktuigKoppelingNum) {
      setNfcScanError(
        "Deze werktuig NFC tag is niet gekoppeld aan een koppeling."
      );
      setNfcScanStep(null);
      setHighlightedTractorKoppeling(null);
      return;
    }
    setHighlightedWerktuigKoppeling(werktuigKoppelingNum);
    setNfcScanStep({ tractor: tractorTag.id, werktuig: werktuigTag.id });

    // Check if tag IDs match (combination requirement)
    if (tractorTag.id !== werktuigTag.id) {
      setNfcScanError(
        "De NFC tags komen niet overeen. Scan dezelfde tag op tractor en werktuig."
      );
      setNfcScanStep(null);
      setHighlightedTractorKoppeling(null);
      setHighlightedWerktuigKoppeling(null);
      return;
    }

    // Check if this pair is already combined
    const alreadyCombined = mappingPairs.some(
      (p) =>
        p.tractor === tractorKoppelingNum || p.werktuig === werktuigKoppelingNum
    );
    if (alreadyCombined) {
      setNfcScanError("Deze koppeling is al gecombineerd.");
      setNfcScanStep(null);
      setHighlightedTractorKoppeling(null);
      setHighlightedWerktuigKoppeling(null);
      return;
    }
    // Add to mappingPairs
    setMappingPairs((prev) => [
      ...prev,
      { tractor: tractorKoppelingNum, werktuig: werktuigKoppelingNum },
    ]);
    // Remove from remaining lists
    setRemainingTractorKoppelingen((prev) =>
      prev.filter((n) => n !== tractorKoppelingNum)
    );
    setRemainingWerktuigKoppelingen((prev) =>
      prev.filter((n) => n !== werktuigKoppelingNum)
    );
    // Reset highlights after a short delay
    setTimeout(() => {
      setHighlightedTractorKoppeling(null);
      setHighlightedWerktuigKoppeling(null);
      setNfcScanStep(null);
    }, 1200);
  } catch (e) {
    setNfcScanError("NFC scan geannuleerd of mislukt.");
    setNfcScanStep(null);
    setHighlightedTractorKoppeling(null);
    setHighlightedWerktuigKoppeling(null);
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
};

// --- Save Koppeling Mapping to Firestore ---
const handleSaveKoppelingMapping = async () => {
  if (!mappingCombinationId || !mappingWerktuig) return;
  try {
    setSavingMapping(true);
    // Prepare mapping object: { werktuigId: { tractorKoppeling: werktuigKoppeling, ... } }
    const mappingObj = {};
    mappingPairs.forEach((pair) => {
      mappingObj[pair.tractor] = pair.werktuig;
    });
    // Save to Firestore under the combination document, under the werktuig id
    const combinationRef = doc(
      db,
      COMBINATIONS_COLLECTION,
      mappingCombinationId
    );
    await updateDoc(combinationRef, {
      [mappingWerktuig.id]: mappingObj,
    });
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
