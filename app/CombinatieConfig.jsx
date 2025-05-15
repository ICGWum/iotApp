import React, { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { showMessage } from "react-native-flash-message";

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

  // Delete combination using helper from Firebase.jsx
  // const handleDeleteCombination = (combination) => {
  //   Alert.alert(
  //     "Combinatie verwijderen",
  //     `Weet je zeker dat je '${combination.name}' wilt verwijderen?`,
  //     [
  //       { text: "Annuleren", style: "cancel" },
  //       {
  //         text: "Verwijderen",
  //         style: "destructive",
  //         onPress: async () => {
  //           const result = await deleteDocument(
  //             COMBINATIONS_COLLECTION,
  //             combination.id
  //           );
  //           if (result.success) {
  //             setCombinations((prev) =>
  //               prev.filter((c) => c.id !== combination.id)
  //             );
  //             showMessage({
  //               message: "Combinatie verwijderd",
  //               type: "success",
  //             });
  //           } else {
  //             showMessage({
  //               message: "Fout bij verwijderen",
  //               description: result.error.message,
  //               type: "danger",
  //             });
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  const handleDeleteCombination = async (combination) => {
    const result = await deleteDocument(
      COMBINATIONS_COLLECTION,
      combination.id
    );
    if (result.success) {
      setCombinations((prev) =>
        prev.filter((c) => c.id !== combination.id)
      );
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

  // Render combination item
  const renderCombinationItem = ({ item }) => {
    const tractor = getTractorInfo(item.tractorId);
    return (
      <View style={styles.combinationItem}>
        <View style={styles.combinationHeader}>
          <Text style={styles.combinationName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.combinationDescription}>
              {item.description}
            </Text>
          )}
          {tractor && (
            <Text style={styles.tractorInfo}>
              Tractor: {tractor.brand} {tractor.model} ({tractor.name})
            </Text>
          )}
        </View>

        <View style={styles.equipmentList}>
          <Text style={styles.sectionTitle}>Werktuigen:</Text>
          {item.equipmentIds && item.equipmentIds.length > 0 ? (
            item.equipmentIds.map((equipId) => {
              const equip = getEquipmentInfo(equipId);
              const mappings = item.connectionMappings?.[equipId] || {};
              return equip ? (
                <View key={equipId} style={styles.equipmentItemContainer}>
                  <Text style={styles.equipmentItem}>
                    • {equip.name} ({equip.type})
                  </Text>
                  {Object.entries(mappings).length > 0 && (
                    <View style={styles.connectionsList}>
                      <Text style={styles.connectionsTitle}>Koppelingen:</Text>
                      {Object.entries(mappings).map(
                        ([werktuigConn, tractorConn]) => (
                          <Text
                            key={werktuigConn}
                            style={styles.connectionItem}
                          >
                            Tractor {tractorConn} ←→ Werktuig {werktuigConn}
                          </Text>
                        )
                      )}
                    </View>
                  )}
                </View>
              ) : null;
            })
          ) : (
            <Text style={styles.noEquipment}>Geen werktuigen gekoppeld</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditCombination(item)}
          >
            <Text style={styles.buttonText}>Bewerken</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCombination(item)}
          >
            <Text style={styles.buttonText}>Verwijderen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render tractor selection item
  const renderTractorItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.selectionItem,
        selectedTractorId === item.id && styles.selectedItem,
      ]}
      onPress={() => {
        setSelectedTractorId(item.id);
        setTractorModalVisible(false);
      }}
    >
      <Text style={styles.itemName}>
        {item.brand} {item.model} ({item.name})
      </Text>
      {item.power && <Text>Vermogen: {item.power} pk</Text>}
    </TouchableOpacity>
  );

  // Render equipment selection item
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

  // Update the connection mapping modal component
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
                              // Dim if this tractor connection is used by another werktuig connection
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
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Combinatie bewerken" : "Nieuwe combinatie toevoegen"}
            </Text>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Naam *</Text>
              <TextInput
                style={styles.input}
                value={combinationName}
                onChangeText={setCombinationName}
                placeholder="Bijv. Combinatie 1, Ploegcombinatie, etc."
              />

              <Text style={styles.inputLabel}>Beschrijving</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={combinationDescription}
                onChangeText={setCombinationDescription}
                placeholder="Optionele beschrijving van de combinatie"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Tractor *</Text>
              <TouchableOpacity
                style={[styles.input, styles.selector]}
                onPress={() => setTractorModalVisible(true)}
              >
                {selectedTractorId ? (
                  <Text>
                    {getTractorInfo(selectedTractorId)?.brand}{" "}
                    {getTractorInfo(selectedTractorId)?.model} (
                    {getTractorInfo(selectedTractorId)?.name})
                  </Text>
                ) : (
                  <Text style={styles.placeholderText}>
                    Selecteer een tractor
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Werktuigen</Text>
              <TouchableOpacity
                style={[styles.input, styles.selector]}
                onPress={() => setEquipmentModalVisible(true)}
              >
                <Text>
                  {selectedEquipmentIds.length > 0
                    ? `${selectedEquipmentIds.length} werktuig(en) geselecteerd`
                    : "Selecteer werktuigen"}
                </Text>
              </TouchableOpacity>

              {selectedEquipmentIds.length > 0 && (
                <View style={styles.selectedEquipmentList}>
                  {selectedEquipmentIds.map((equipId) => {
                    const equip = getEquipmentInfo(equipId);
                    return equip ? (
                      <View key={equipId} style={styles.selectedEquipmentItem}>
                        <Text>{equip.name}</Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => toggleEquipmentSelection(equipId)}
                        >
                          <Text style={styles.removeButtonText}>X</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null;
                  })}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveCombination}
              >
                <Text style={styles.buttonText}>Opslaan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tractor Selection Modal */}
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
                renderItem={renderTractorItem}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  combinationItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  combinationHeader: {
    marginBottom: 10,
  },
  combinationName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  combinationDescription: {
    color: "#666",
    marginBottom: 4,
  },
  tractorInfo: {
    fontWeight: "500",
    color: "#2196F3",
  },
  equipmentList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  equipmentItem: {
    marginLeft: 8,
    marginBottom: 2,
  },
  noEquipment: {
    fontStyle: "italic",
    color: "#666",
    marginLeft: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 90,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    maxHeight: 350,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
  },
  selectedEquipmentList: {
    marginBottom: 16,
  },
  selectedEquipmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
  },
  removeButton: {
    backgroundColor: "#ffcdd2",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#b71c1c",
    fontWeight: "bold",
    fontSize: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  closeButton: {
    backgroundColor: "#2196F3",
    marginTop: 16,
  },
  selectionList: {
    maxHeight: 350,
  },
  selectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedItem: {
    backgroundColor: "#e3f2fd",
  },
  selectionItemContent: {
    flex: 1,
  },
  itemName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#2196F3",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#2196F3",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptySelectionList: {
    padding: 20,
    alignItems: "center",
  },
  warningText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  mappingContainer: {
    flex: 1,
    minHeight: 100,
    marginBottom: 16,
  },
  mappingLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mappingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  mappingWerktuig: {
    flex: 1,
    alignItems: "center",
  },
  mappingArrowContainer: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 25,
  },
  mappingTractor: {
    flex: 2,
    alignItems: "center",
  },
  mappingLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  connectionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  connectionBadgeMapped: {
    backgroundColor: "#2196F3",
    borderColor: "#1976D2",
  },
  connectionNumber: {
    fontSize: 18,
    color: "#666",
  },
  connectionNumberMapped: {
    color: "#fff",
  },
  tractorConnectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
    maxWidth: 200,
  },
  tractorConnectionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  tractorConnectionButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#1976D2",
  },
  tractorConnectionButtonUsed: {
    opacity: 0.5,
  },
  tractorConnectionNumber: {
    fontSize: 16,
    color: "#666",
  },
  tractorConnectionNumberSelected: {
    color: "#fff",
  },
  mappingArrow: {
    fontSize: 24,
    color: "#666",
  },
  mappingHeaderContainer: {
    marginBottom: 16,
  },
  mappingContentContainer: {
    paddingBottom: 16,
  },
});
