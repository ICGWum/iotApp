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
import NfcManager, { NfcTech } from "react-native-nfc-manager";

const COLLECTION_NAME = "tractors";

export default function TractorManagement({ navigation }) {
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
  const [scanningIndex, setScanningIndex] = useState(1); // current koppeling being scanned (start at 1)
  const [scannedTags, setScannedTags] = useState({}); // temp storage for scanned NFC ids
  const [scanTargetTractor, setScanTargetTractor] = useState(null); // tractor being scanned

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

  useEffect(() => {
    const koppelingen = parseInt(aantalKoppelingen);
    if (!isNaN(koppelingen) && koppelingen > 0) {
      setTags((prevTags) => {
        const updatedTags = { ...prevTags };
        // Start at 1 instead of 0
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
  };

  const handleAddTractor = () => {
    resetForm();
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
    setEditMode(true);
    setModalVisible(true);
  };

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
        tags,
        updatedAt: new Date(),
      };

      if (editMode && currentTractor) {
        const tractorRef = doc(db, COLLECTION_NAME, currentTractor.id);
        await updateDoc(tractorRef, tractorData);
        showMessage({ message: "Tractor bijgewerkt", type: "success" });
      } else {
        tractorData.createdAt = new Date();
        const newTractorId = await generateNextTractorId();
        const tractorRef = doc(db, COLLECTION_NAME, newTractorId);
        await setDoc(tractorRef, tractorData);
        showMessage({ message: "Tractor toegevoegd", type: "success" });
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
        {item.tags &&
          Object.entries(item.tags).map(([key, value]) => (
            <Text key={key}>
              Koppeling {key}: {value}
            </Text>
          ))}
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
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: "#FFA500", marginTop: 8 },
          ]}
          onPress={() => handleOpenScanModal(item)}
        >
          <Text style={styles.buttonText}>Scan koppelingen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

  // const scanNfcTag = async (koppelingNum) => {
  //   try {
  //     await NfcManager.start();
  //     await NfcManager.requestTechnology(NfcTech.Ndef);
  //     const tag = await NfcManager.getTag();
  //     const tagId =
  //       tag.id ||
  //       (tag.ndefMessage && tag.ndefMessage[0]?.id) ||
  //       `NFC_TAG_${Date.now()}`;
  //     setScannedTags((prev) => ({ ...prev, [koppelingNum]: tagId }));
  //     showMessage({
  //       message: `Koppeling ${koppelingNum} gescand!`,
  //       type: "success",
  //     });
  //   } catch (e) {
  //     showMessage({ message: `Scan geannuleerd of mislukt`, type: "warning" });
  //   } finally {
  //     NfcManager.cancelTechnologyRequest();
  //   }
  // };
  const scanNfcTag = async (koppelingNum) => {
    // MOCK: Simulate a scan with a timeout and fake tag ID
    setTimeout(() => {
      setScannedTags((prev) => ({
        ...prev,
        [koppelingNum]: `FAKE_TAG_ID_${koppelingNum}_${Date.now()}`,
      }));
      showMessage({
        message: `Koppeling ${koppelingNum} gescand! (gesimuleerd)`,
        type: "success",
      });
    }, 500);
  };

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
                placeholder="e.g. John Deere, Fendt"
              />

              <Text style={styles.inputLabel}>Model *</Text>
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder="e.g. 6120R"
              />

              <Text style={styles.inputLabel}>Serienummer</Text>
              <TextInput
                style={styles.input}
                value={serialNumber}
                onChangeText={setSerialNumber}
                placeholder="e.g. SN1234"
              />

              <Text style={styles.inputLabel}>Vermogen (pk)</Text>
              <TextInput
                style={styles.input}
                value={power}
                onChangeText={setPower}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Bouwjaar</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Aantal koppelingen</Text>
              <TextInput
                style={styles.input}
                value={aantalKoppelingen}
                onChangeText={setAantalKoppelingen}
                keyboardType="numeric"
              />

              {/* Removed the manual tag input fields from here */}
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

      {/* NFC Scan Modal */}
      <Modal
        visible={scanModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScanModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {scanTargetTractor &&
            scanningIndex <= parseInt(scanTargetTractor.aantalKoppelingen) ? (
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
                  onPress={async () => await scanNfcTag(scanningIndex)}
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
                      {scanningIndex ===
                      parseInt(scanTargetTractor.aantalKoppelingen)
                        ? "Overzicht"
                        : "Next"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : scanTargetTractor ? (
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
            ) : null}
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
    backgroundColor: "#FF0000",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  scanTagButton: {
    width: "100%",
    minHeight: 64,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    borderWidth: 2,
    borderColor: "#bdbdbd",
  },
  scanTagButtonDefault: {
    backgroundColor: "#00bee1",
  },
  scanTagButtonScanned: {
    backgroundColor: "#4CAF50", // green
    borderColor: "#388E3C",
  },
  scanTagButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
    letterSpacing: 1,
  },
});
