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
import { db, deleteDocument } from "./Firebase";
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

const COLLECTION_NAME = "equipment";

export default function EquipmentManagement({ navigation }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);

  const [tags, setTags] = useState({});
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanningIndex, setScanningIndex] = useState(1);
  const [scannedTags, setScannedTags] = useState({});

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

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Add this effect to keep tags in sync with aantalKoppelingen
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
        // Remove tags above the current count
        Object.keys(updatedTags).forEach((key) => {
          if (parseInt(key) > koppelingen) delete updatedTags[key];
        });
        return updatedTags;
      });
    } else {
      setTags({});
    }
  }, [aantalKoppelingen]);

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
    setTags({}); // ensure tags are empty for new equipment
    setScannedTags({}); // ensure scannedTags are empty for new equipment
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
    setTags(equipment.tags || {}); // <-- load tags when editing
    setEditMode(true);
    setModalVisible(true);
  };

  // Save equipment (add new or update existing)
  const handleSaveEquipment = async () => {
    if (!name || !type) {
      showMessage({
        message: "Verplichte velden ontbreken",
        description: "Naam en type zijn verplicht",
        type: "warning",
      });
      return;
    }

    // Always use the latest scannedTags if available
    const tagsToSave = Object.keys(scannedTags).length > 0 ? scannedTags : tags;

    try {
      const equipmentData = {
        name,
        type,
        brand,
        serialNumber,
        debiet: debiet ? parseFloat(debiet) : null,
        druk: druk ? parseFloat(druk) : null,
        aantalKoppelingen: aantalKoppelingen ? aantalKoppelingen : "",
        tags: { ...tagsToSave }, // ensure tags mapping is saved
        updatedAt: new Date(),
      };

      if (editMode && currentEquipment) {
        const equipmentRef = doc(db, COLLECTION_NAME, currentEquipment.id);
        await updateDoc(equipmentRef, equipmentData);
        showMessage({
          message: "Werktuig bijgewerkt",
          type: "success",
        });
      } else {
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

  // Delete equipment using helper from Firebase.jsx
  // const handleDeleteEquipment = (equipment) => {
  //   Alert.alert(
  //     "Werktuig verwijderen",
  //     `Weet je zeker dat je ${equipment.name} wilt verwijderen?`,
  //     [
  //       { text: "Annuleren", style: "cancel" },
  //       {
  //         text: "Verwijderen",
  //         style: "destructive",
  //         onPress: async () => {
  //           const result = await deleteDocument(COLLECTION_NAME, equipment.id);
  //           if (result.success) {
  //             setEquipment((prev) => prev.filter((e) => e.id !== equipment.id));
  //             showMessage({
  //               message: "Werktuig verwijderd",
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

  const handleDeleteEquipment = async (equipment) => {
    const result = await deleteDocument(COLLECTION_NAME, equipment.id);
    if (result.success) {
      setEquipment((prev) => prev.filter((e) => e.id !== equipment.id));
      showMessage({
        message: "Werktuig verwijderd",
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

  // Add this function to save scanned tags for equipment, just like TractorManagement
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
      setEquipment((prev) =>
        prev.map((e) => (e.id === currentEquipment.id ? updatedEquipment : e))
      );
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
        {item.tags && Object.keys(item.tags).length > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontWeight: "bold" }}>Koppelingen:</Text>
            {Object.keys(item.tags)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((key) => (
                <Text key={key}>
                  Koppeling {key}: {item.tags[key]}
                </Text>
              ))}
          </View>
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
        <TouchableOpacity
          style={{
            backgroundColor: "#FF9800", // orange for consistency
            padding: 10,
            borderRadius: 6,
            marginTop: 8,
            alignItems: "center",
          }}
          onPress={() => {
            setCurrentEquipment(item);
            setTags(item.tags || {});
            setScannedTags(item.tags || {}); // only prefill with real tags, not fake
            setAantalKoppelingen(
              item.aantalKoppelingen ? item.aantalKoppelingen.toString() : ""
            );
            setScanningIndex(1);
            setScanModalVisible(true);
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Scan koppelingen
          </Text>
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
      </ScrollView>

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

              {Object.keys(tags).length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Gescande koppelingen:
                  </Text>
                  {Object.keys(tags)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map((key) => (
                      <Text key={key}>
                        Koppeling {key}: {tags[key]}
                      </Text>
                    ))}
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
                onPress={handleSaveEquipment}
              >
                <Text style={styles.buttonText}>Opslaan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scan Modal */}
      <Modal
        visible={scanModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScanModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {scanningIndex <= parseInt(aantalKoppelingen || "0") ? (
              <>
                <Text
                  style={styles.modalTitle}
                >{`Koppeling ${scanningIndex}`}</Text>
                <TouchableOpacity
                  style={[
                    styles.scanTagButton,
                    scannedTags[scanningIndex]
                      ? styles.scanTagButtonScanned
                      : styles.scanTagButtonDefault,
                  ]}
                  onPress={async () => {
                    // MOCK: Simulate NFC scan (replace with real NFC code)
                    setTimeout(() => {
                      setScannedTags((prev) => ({
                        ...prev,
                        [scanningIndex]: `FAKE_TAG_ID_${scanningIndex}_${Date.now()}`,
                      }));
                      showMessage({
                        message: `Koppeling ${scanningIndex} gescand! (gesimuleerd)`,
                        type: "success",
                      });
                    }, 500);
                  }}
                  disabled={!!scannedTags[scanningIndex]}
                >
                  <Text style={styles.scanTagButtonText}>
                    {scannedTags[scanningIndex] ? "Gescand" : "SCAN TAG"}
                  </Text>
                </TouchableOpacity>
                {scannedTags[scanningIndex] && (
                  <Text style={{ color: "#4CAF50", marginBottom: 12 }}>
                    Tag: {scannedTags[scanningIndex]}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 24,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.cancelButton,
                      { flex: 1, marginRight: 8 },
                    ]}
                    onPress={() => setScanModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Exit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.saveButton,
                      { flex: 1, marginLeft: 8 },
                    ]}
                    onPress={() => setScanningIndex((prev) => prev + 1)}
                    disabled={!scannedTags[scanningIndex]}
                  >
                    <Text style={styles.buttonText}>
                      {scanningIndex === parseInt(aantalKoppelingen)
                        ? "Overzicht"
                        : "Next"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Overzicht</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  {Object.keys(scannedTags)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map((key) => (
                      <Text key={key}>
                        Koppeling {key}: {scannedTags[key]}
                      </Text>
                    ))}
                </ScrollView>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    { marginTop: 16 },
                  ]}
                  onPress={handleSaveScannedTags}
                >
                  <Text style={styles.buttonText}>Opslaan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    { marginTop: 8 },
                  ]}
                  onPress={() => setScanModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Annuleren</Text>
                </TouchableOpacity>
              </>
            )}
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
    backgroundColor: "#FF0000",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  scanTagButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  scanTagButtonDefault: {
    backgroundColor: "#00bee1",
  },
  scanTagButtonScanned: {
    backgroundColor: "#4CAF50",
  },
  scanTagButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
