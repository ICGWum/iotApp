import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { db } from "./Firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { showMessage } from "react-native-flash-message";

const COLLECTION_NAME = "equipment";

export default function EquipmentManagement({ navigation }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [debiet, setDebiet] = useState("");
  const [druk, setDruk] = useState("");
  const [aantalKoppelingen, setAantalKoppelingen] = useState("");

  // Generate next equipment ID
  const generateNextEquipmentId = async () => {
    try {
      // Get all documents and find the highest number
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      let highestNumber = 0;

      querySnapshot.docs.forEach((document) => {
        const docId = document.id;
        if (docId.startsWith("werktuig-")) {
          const numberPart = docId.split("-")[1];
          const number = parseInt(numberPart);
          if (!isNaN(number) && number > highestNumber) {
            highestNumber = number;
          }
        }
      });

      // Return next ID
      return `werktuig-${highestNumber + 1}`;
    } catch (error) {
      console.error("Error generating equipment ID:", error);
      return `werktuig-${new Date().getTime()}`;
    }
  };

  // Fetch all equipment from Firestore
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
      console.error("Error fetching equipment:", error);
      showMessage({
        message: "Fout bij laden van werktuigen",
        description: error.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load equipment when component mounts
  useEffect(() => {
    fetchEquipment();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setName("");
    setType("");
    setBrand("");
    setSerialNumber("");
    setDebiet("");
    setDruk("");
    setAantalKoppelingen("");
    setCurrentEquipment(null);
    setEditMode(false);
  };

  // Open modal for adding new equipment
  const handleAddEquipment = () => {
    resetForm();
    setModalVisible(true);
  };

  // Open modal for editing equipment
  const handleEditEquipment = (equipment) => {
    setCurrentEquipment(equipment);
    setName(equipment.name || "");
    setType(equipment.type || "");
    setBrand(equipment.brand || "");
    setSerialNumber(equipment.serialNumber || "");
    setDebiet(equipment.debiet ? equipment.debiet.toString() : "");
    setDruk(equipment.druk ? equipment.druk.toString() : "");
    setAantalKoppelingen(
      equipment.aantalKoppelingen ? equipment.aantalKoppelingen.toString() : ""
    );
    setEditMode(true);
    setModalVisible(true);
  };

  // Save equipment (add new or update existing)
  const handleSaveEquipment = async () => {
    // Validate inputs
    if (!name || !type) {
      showMessage({
        message: "Verplichte velden ontbreken",
        description: "Naam en type zijn verplicht",
        type: "warning",
      });
      return;
    }

    try {
      const equipmentData = {
        name,
        type,
        brand,
        serialNumber,
        debiet: debiet ? parseFloat(debiet) : null,
        druk: druk ? parseFloat(druk) : null,
        aantalKoppelingen: aantalKoppelingen
          ? parseInt(aantalKoppelingen)
          : null,
        updatedAt: new Date(),
      };

      if (editMode && currentEquipment) {
        // Update existing equipment
        const equipmentRef = doc(db, COLLECTION_NAME, currentEquipment.id);
        await updateDoc(equipmentRef, equipmentData);
        showMessage({
          message: "Werktuig bijgewerkt",
          type: "success",
        });
      } else {
        // Add new equipment with custom ID
        equipmentData.createdAt = new Date();
        const newEquipmentId = await generateNextEquipmentId();
        const equipmentRef = doc(db, COLLECTION_NAME, newEquipmentId);
        await setDoc(equipmentRef, equipmentData);
        showMessage({
          message: "Werktuig toegevoegd",
          type: "success",
        });
      }

      setModalVisible(false);
      resetForm();
      fetchEquipment();
    } catch (error) {
      console.error("Error saving equipment:", error);
      showMessage({
        message: "Fout bij opslaan",
        description: error.message,
        type: "danger",
      });
    }
  };

  // Simple UI-only delete function
  const handleDeleteEquipment = (equipment) => {
    Alert.alert(
      "Werktuig verwijderen",
      `Weet je zeker dat je ${equipment.name} wilt verwijderen uit de weergave?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen uit weergave",
          style: "destructive",
          onPress: () => {
            // Just update the UI by filtering out this equipment
            setEquipment((prev) => prev.filter((e) => e.id !== equipment.id));

            showMessage({
              message: "Werktuig verwijderd uit weergave",
              description:
                "Het item is alleen uit de weergave verwijderd, niet uit de database.",
              type: "success",
            });
          },
        },
      ]
    );
  };

  // Render equipment item
  const renderEquipmentItem = ({ item }) => (
    <View style={styles.equipmentItem}>
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentName}>{item.name}</Text>
        <Text>Type: {item.type}</Text>
        {item.brand && <Text>Merk: {item.brand}</Text>}
        {item.serialNumber && <Text>Serienummer: {item.serialNumber}</Text>}
        {item.debiet && <Text>Debiet: {item.debiet} l/min</Text>}
        {item.druk && <Text>Druk: {item.druk} bar</Text>}
        {item.aantalKoppelingen && (
          <Text>Aantal koppelingen: {item.aantalKoppelingen}</Text>
        )}
      </View>
      <View style={styles.equipmentActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditEquipment(item)}
        >
          <Text style={styles.buttonText}>Bewerken</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteEquipment(item)}
        >
          <Text style={styles.buttonText}>Verwijderen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && equipment.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Werktuigen laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Werktuigbeheer</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddEquipment}
          >
            <Text style={styles.buttonText}>+ Werktuig toevoegen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {equipment.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Geen werktuigen gevonden</Text>
          <Text>Voeg je eerste werktuig toe met de knop hierboven</Text>
        </View>
      ) : (
        <FlatList
          data={equipment}
          renderItem={renderEquipmentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Add/Edit Equipment Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Werktuig bewerken" : "Nieuw werktuig toevoegen"}
            </Text>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Naam *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Voer naam werktuig in"
              />

              <Text style={styles.inputLabel}>Type *</Text>
              <TextInput
                style={styles.input}
                value={type}
                onChangeText={setType}
                placeholder="Voer type in (bijv. Ploeg, Spuit)"
              />

              <Text style={styles.inputLabel}>Merk</Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="Voer merk in"
              />

              <Text style={styles.inputLabel}>Serienummer</Text>
              <TextInput
                style={styles.input}
                value={serialNumber}
                onChangeText={setSerialNumber}
                placeholder="e.g. xxxx-xxxx-xxxx-xxxx"
              />

              <Text style={styles.inputLabel}>Debiet (l/min)</Text>
              <TextInput
                style={styles.input}
                value={debiet}
                onChangeText={setDebiet}
                placeholder="Voer debiet in l/min in"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Druk (bar)</Text>
              <TextInput
                style={styles.input}
                value={druk}
                onChangeText={setDruk}
                placeholder="Voer druk in bar in"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Aantal koppelingen</Text>
              <TextInput
                style={styles.input}
                value={aantalKoppelingen}
                onChangeText={setAantalKoppelingen}
                placeholder="Voer aantal koppelingen in"
                keyboardType="numeric"
              />
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
                onPress={handleSaveEquipment}
              >
                <Text style={styles.buttonText}>Opslaan</Text>
              </TouchableOpacity>
            </View>
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
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
  equipmentItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  equipmentActions: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 70,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
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
    maxHeight: 300,
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
});
