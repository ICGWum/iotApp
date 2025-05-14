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
import { db } from "./Firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { showMessage } from "react-native-flash-message";

const COMBINATIONS_COLLECTION = "combinations";
const TRACTORS_COLLECTION = "tractors";
const EQUIPMENT_COLLECTION = "equipment";

export default function CombinatieConfig() {
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

  // Fetch all combinations
  const fetchCombinations = async () => {
    try {
      setLoading(true);
      const combinationsSnapshot = await getDocs(
        collection(db, COMBINATIONS_COLLECTION)
      );

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

  // Load data when component mounts
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
    setEditMode(true);
    setModalVisible(true);
  };

  // Delete combination
  const handleDeleteCombination = (combination) => {
    Alert.alert(
      "Combinatie verwijderen",
      `Weet je zeker dat je '${combination.name}' wilt verwijderen?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, COMBINATIONS_COLLECTION, combination.id));
              setCombinations((prev) =>
                prev.filter((c) => c.id !== combination.id)
              );
              showMessage({
                message: "Combinatie verwijderd",
                type: "success",
              });
            } catch (error) {
              console.error("Error deleting combination:", error);
              showMessage({
                message: "Fout bij verwijderen",
                description: error.message,
                type: "danger",
              });
            }
          },
        },
      ]
    );
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

  // Toggle equipment selection
  const toggleEquipmentSelection = (equipmentId) => {
    setSelectedEquipmentIds((prev) => {
      if (prev.includes(equipmentId)) {
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
              return equip ? (
                <Text key={equipId} style={styles.equipmentItem}>
                  • {equip.name} ({equip.type})
                </Text>
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
  const renderEquipmentItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.selectionItem,
        selectedEquipmentIds.includes(item.id) && styles.selectedItem,
      ]}
      onPress={() => toggleEquipmentSelection(item.id)}
    >
      <View style={styles.selectionItemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text>Type: {item.type}</Text>
        {item.brand && <Text>Merk: {item.brand}</Text>}
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
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
    maxHeight: "80%",
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
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 8,
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
});
