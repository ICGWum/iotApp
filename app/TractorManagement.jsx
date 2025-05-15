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
} from "react-native";
import { db, deleteDocument } from "./Firebase";
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

const COLLECTION_NAME = "tractors";

export default function TractorManagement({ navigation }) {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTractor, setCurrentTractor] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [power, setPower] = useState("");
  const [year, setYear] = useState("");
  const [aantalKoppelingen, setAantalKoppelingen] = useState("");

  // Generate next tractor ID
  const generateNextTractorId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      let highestNumber = 0;
      querySnapshot.docs.forEach((document) => {
        const docId = document.id;
        if (docId.startsWith("tractor-")) {
          const numberPart = docId.split("-")[1];
          const number = parseInt(numberPart);
          if (!isNaN(number) && number > highestNumber) {
            highestNumber = number;
          }
        }
      });
      return `tractor-${highestNumber + 1}`;
    } catch (error) {
      console.error("Error generating tractor ID:", error);
      return `tractor-${new Date().getTime()}`;
    }
  };

  // Fetch all tractors from Firestore
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
      console.error("Error fetching tractors:", error);
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

  // Reset form fields
  const resetForm = () => {
    setName("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setPower("");
    setYear("");
    setAantalKoppelingen("");
    setCurrentTractor(null);
    setEditMode(false);
  };

  // Open modal for adding new tractor
  const handleAddTractor = () => {
    resetForm();
    setModalVisible(true);
  };

  // Open modal for editing tractor
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
    setEditMode(true);
    setModalVisible(true);
  };

  // Save tractor (add new or update existing)
  const handleSaveTractor = async () => {
    if (!name || !brand || !model) {
      showMessage({
        message: "Verplichte velden ontbreken",
        description: "Naam, merk en model zijn verplicht",
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
        updatedAt: new Date(),
      };

      if (editMode && currentTractor) {
        const tractorRef = doc(db, COLLECTION_NAME, currentTractor.id);
        await updateDoc(tractorRef, tractorData);
        showMessage({
          message: "Tractor bijgewerkt",
          type: "success",
        });
      } else {
        tractorData.createdAt = new Date();
        const newTractorId = await generateNextTractorId();
        const tractorRef = doc(db, COLLECTION_NAME, newTractorId);
        await setDoc(tractorRef, tractorData);
        showMessage({
          message: "Tractor toegevoegd",
          type: "success",
        });
      }

      setModalVisible(false);
      resetForm();
      fetchTractors();
    } catch (error) {
      console.error("Error saving tractor:", error);
      showMessage({
        message: "Fout bij opslaan",
        description: error.message,
        type: "danger",
      });
    }
  };

  // Delete tractor using helper from Firebase.jsx
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

  // Render tractor item
  const renderTractorItem = ({ item }) => (
    <View style={styles.tractorItem}>
      <View style={styles.tractorInfo}>
        <Text style={styles.tractorName}>{item.name}</Text>
        <Text>Merk: {item.brand}</Text>
        <Text>Model: {item.model}</Text>
        {item.serialNumber && <Text>Serienummer: {item.serialNumber}</Text>}
        {item.power && <Text>Vermogen: {item.power} pk</Text>}
        {item.year && <Text>Bouwjaar: {item.year}</Text>}
        {item.aantalKoppelingen && (
          <Text>Aantal koppelingen: {item.aantalKoppelingen}</Text>
        )}
      </View>
      <View style={styles.tractorActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditTractor(item)}
        >
          <Text style={styles.buttonText}>Bewerken</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteTractor(item.id)}
        >
          <Text style={styles.buttonText}>Verwijderen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && tractors.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Tractoren laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tractorbeheer</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTractor}>
            <Text style={styles.buttonText}>+ Tractor toevoegen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tractors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Geen tractoren gevonden</Text>
          <Text>Voeg je eerste tractor toe met de knop hierboven</Text>
        </View>
      ) : (
        <FlatList
          data={tractors}
          renderItem={renderTractorItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Add/Edit Tractor Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Tractor bewerken" : "Nieuwe tractor toevoegen"}
            </Text>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Naam *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Voer naam tractor in"
              />

              <Text style={styles.inputLabel}>Merk *</Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g. John Deere, Fendt, New Holland"
              />

              <Text style={styles.inputLabel}>Model *</Text>
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder="e.g. 6120R, 724 Vario"
              />

              <Text style={styles.inputLabel}>Serienummer</Text>
              <TextInput
                style={styles.input}
                value={serialNumber}
                onChangeText={setSerialNumber}
                placeholder="e.g. xxxx-xxxx-xxxx-xxxx"
              />

              <Text style={styles.inputLabel}>Vermogen (pk)</Text>
              <TextInput
                style={styles.input}
                value={power}
                onChangeText={setPower}
                placeholder="e.g. 120"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Bouwjaar</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 2012"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Aantal koppelingen</Text>
              <TextInput
                style={styles.input}
                value={aantalKoppelingen}
                onChangeText={setAantalKoppelingen}
                placeholder="e.g. 4"
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
                onPress={handleSaveTractor}
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
  tractorItem: {
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
  tractorInfo: {
    flex: 1,
  },
  tractorName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tractorActions: {
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
