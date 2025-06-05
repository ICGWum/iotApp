import React, { useState, useEffect } from "react";
import styles from "./styles/tractor";
import { Platform } from "react-native";
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
  Image,
  Alert,
  Animated,
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
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

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

  const [imageUri, setImageUri] = useState("");
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoTractor, setInfoTractor] = useState(null);
  const [expandedTags, setExpandedTags] = useState({}); // {tractorId: true/false}

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (Platform.OS !== "web") {
      NfcManager.start();
    }
  }, []);

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
    if (!name || !brand || !model) {
      showMessage({
        message: "Verplichte velden ontbreken",
        description: "Naam, merk en model zijn verplicht",
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
        // If name changed, delete old doc and create new one
        if (currentTractor.id !== tractorId) {
          // Remove old doc
          await deleteDocument(COLLECTION_NAME, currentTractor.id);
          // Create new doc with new ID
          const tractorRef = doc(db, COLLECTION_NAME, tractorId);
          await setDoc(tractorRef, {
            ...tractorData,
            createdAt: currentTractor.createdAt || new Date(),
          });
        } else {
          // Update existing doc
          const tractorRef = doc(db, COLLECTION_NAME, tractorId);
          await updateDoc(tractorRef, tractorData);
        }
        showMessage({ message: "Tractor bijgewerkt", type: "success" });
      } else {
        // New tractor, use name as ID
        const tractorRef = doc(db, COLLECTION_NAME, tractorId);
        await setDoc(tractorRef, { ...tractorData, createdAt: new Date() });
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

  const renderTractorItem = ({ item }) => {
    return (
      <View style={styles.tractorItem}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {item.imageUri && (
            <Image
              source={{ uri: item.imageUri }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                backgroundColor: "#eee",
                marginRight: 12,
                alignSelf: "center",
              }}
              resizeMode="cover"
            />
          )}
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{ fontWeight: "bold", flexShrink: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.brand} {item.model}
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() => {
                setInfoTractor(item);
                setInfoModalVisible(true);
              }}
              style={{ marginLeft: 8, alignSelf: "center" }}
            >
              <Ionicons
                name="information-circle-outline"
                size={28}
                color="#2196F3"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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

  // const scanNfcTag = async (koppelingNum) => {
  //   // MOCK: Simulate a scan with a timeout and fake tag ID
  //   setTimeout(() => {
  //     setScannedTags((prev) => ({
  //       ...prev,
  //       [koppelingNum]: `FAKE_TAG_ID_${koppelingNum}_${Date.now()}`,
  //     }));
  //     showMessage({
  //       message: `Koppeling ${koppelingNum} gescand! (gesimuleerd)`,
  //       type: "success",
  //     });
  //   }, 500);
  // };

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

              <TouchableOpacity
                style={{
                  backgroundColor: imageUri ? "#4CAF50" : "#2196F3",
                  padding: 12,
                  borderRadius: 6,
                  alignItems: "center",
                  marginBottom: 16,
                }}
                onPress={handlePickImage}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {imageUri ? "Afbeelding geselecteerd" : "Afbeelding uploaden"}
                </Text>
              </TouchableOpacity>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    alignSelf: "center",
                    marginBottom: 12,
                  }}
                  resizeMode="cover"
                />
              ) : null}
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
                >
                  <Text style={styles.scanTagButtonText}>Scan NFC Tag</Text>
                </TouchableOpacity>
                {scannedTags[scanningIndex] &&
                  scannedTags[scanningIndex] !== "" && (
                    <Text style={{ color: "#4CAF50", marginBottom: 12 }}>
                      Gescand{"\n"}Tag: {scannedTags[scanningIndex]}
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
      {/* Info Modal */}
      <Modal
        visible={infoModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tractor informatie</Text>
            {infoTractor && (
              <View>
                <Text>Naam: {infoTractor.name}</Text>
                <Text>Merk: {infoTractor.brand}</Text>
                <Text>Model: {infoTractor.model}</Text>
                <Text>Serienummer: {infoTractor.serialNumber}</Text>
                <Text>Aantal koppelingen: {infoTractor.aantalKoppelingen}</Text>
                <Text>Vermogen: {infoTractor.power}</Text>
                <Text>Bouwjaar: {infoTractor.year}</Text>
                {/* Koppelingen/tags mapping, expandable */}
                {infoTractor.tags &&
                  Object.keys(infoTractor.tags).length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>Koppelingen:</Text>
                      {Object.entries(infoTractor.tags)
                        .slice(0, expandedTags[infoTractor.id] ? undefined : 4)
                        .map(([key, value]) => (
                          <Text key={key}>
                            Koppeling {key}: {value}
                          </Text>
                        ))}
                      {Object.keys(infoTractor.tags).length > 4 &&
                        !expandedTags[infoTractor.id] && (
                          <TouchableOpacity
                            onPress={() =>
                              setExpandedTags((prev) => ({
                                ...prev,
                                [infoTractor.id]: true,
                              }))
                            }
                          >
                            <Text style={{ color: "#2196F3", marginTop: 2 }}>
                              See more...
                            </Text>
                          </TouchableOpacity>
                        )}
                      {expandedTags[infoTractor.id] && (
                        <TouchableOpacity
                          onPress={() =>
                            setExpandedTags((prev) => ({
                              ...prev,
                              [infoTractor.id]: false,
                            }))
                          }
                        >
                          <Text style={{ color: "#2196F3", marginTop: 2 }}>
                            Show less
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                {/* Action buttons */}
                <View style={{ marginTop: 24 }}>
                  <TouchableOpacity
                    style={[
                      styles.infoModalButton,
                      { backgroundColor: "#4CAF50", alignSelf: "center" },
                    ]}
                    onPress={() => {
                      setInfoModalVisible(false);
                      handleEditTractor(infoTractor);
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Bewerken
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.infoModalButton,
                      {
                        backgroundColor: "#f44336",
                        alignSelf: "center",
                        width: 240,
                        overflow: "hidden",
                      },
                    ]}
                    onPress={() => {
                      if (deleteConfirmId === infoTractor.id) {
                        setDeleteConfirmId(null);
                        deleteTractor(infoTractor.id);
                      } else {
                        setDeleteConfirmId(infoTractor.id);
                        setTimeout(() => {
                          setDeleteConfirmId(null);
                        }, 3000);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: deleteConfirmId === infoTractor.id ? "100%" : 0,
                        backgroundColor: "rgba(128,128,128,0.4)",
                        zIndex: 1,
                        transitionProperty: "width",
                        transitionDuration: "3s",
                      }}
                    />
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 17,
                        zIndex: 2,
                      }}
                    >
                      {deleteConfirmId === infoTractor.id
                        ? "Verwijderen bevestigen"
                        : "Verwijderen"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.infoModalButton,
                      { backgroundColor: "#FFA500", alignSelf: "center" },
                    ]}
                    onPress={() => {
                      setInfoModalVisible(false);
                      handleOpenScanModal(infoTractor);
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Scan koppelingen
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.infoModalButton,
                    {
                      backgroundColor: "#2196F3",
                      alignSelf: "center",
                      marginTop: 16,
                    },
                  ]}
                  onPress={() => setInfoModalVisible(false)}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}
                  >
                    Sluiten
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
