import React, { useState, useEffect } from "react";
import styles from "./styles/werktuig";
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
  Image,
  Animated,
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
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const COLLECTION_NAME = "equipment";

export default function EquipmentManagement({ navigation }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoEquipment, setInfoEquipment] = useState(null);

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
  const [imageUri, setImageUri] = useState("");

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
    setImageUri(""); // reset image
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
    setImageUri(equipment.imageUri || ""); // load image
    setEditMode(true);
    setModalVisible(true);
  };

  // Open info modal for equipment
  const handleInfoEquipment = (equipment) => {
    setInfoEquipment(equipment);
    setInfoModalVisible(true);
  };

  // Pick image
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
    if (!imageUri) {
      showMessage({
        message: "Afbeelding vereist",
        description: "Upload een afbeelding van het werktuig",
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
        tags: { ...tagsToSave },
        imageUri,
        updatedAt: new Date(),
      };

      const equipmentId = name.trim();
      if (!equipmentId) {
        showMessage({
          message: "Naam is verplicht als ID",
          type: "warning",
        });
        return;
      }

      if (editMode && currentEquipment) {
        // If name changed, delete old doc and create new one
        if (currentEquipment.id !== equipmentId) {
          // Delete old
          await deleteDocument(COLLECTION_NAME, currentEquipment.id);
          // Create new
          const equipmentRef = doc(db, COLLECTION_NAME, equipmentId);
          await setDoc(equipmentRef, {
            ...equipmentData,
            createdAt: new Date(),
          });
        } else {
          // Update existing
          const equipmentRef = doc(db, COLLECTION_NAME, equipmentId);
          await updateDoc(equipmentRef, equipmentData);
        }
        showMessage({ message: "Werktuig bijgewerkt", type: "success" });
      } else {
        // New equipment, use name as ID
        const equipmentRef = doc(db, COLLECTION_NAME, equipmentId);
        await setDoc(equipmentRef, { ...equipmentData, createdAt: new Date() });
        showMessage({ message: "Werktuig toegevoegd", type: "success" });
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
    <View
      style={[
        styles.equipmentItem,
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: "#fff",
          borderRadius: 12,
          marginBottom: 12,
        },
      ]}
    >
      {/* Image left - bigger, like tractors */}
      {item.imageUri ? (
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
      ) : (
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            marginRight: 12,
            backgroundColor: "#f2f2f2",
          }}
        />
      )}
      {/* Name center - show type if available, else name */}
      <Text style={{ flex: 1, fontWeight: "bold", fontSize: 16 }}>
        {item.type ? item.type : item.name}
      </Text>
      {/* Info icon right */}
      <TouchableOpacity
        onPress={() => {
          setInfoEquipment(item);
          setInfoModalVisible(true);
        }}
        style={{ padding: 4 }}
      >
        <Ionicons name="information-circle-outline" size={24} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );

  // Expansion state for koppelingen
  const [expandedTags, setExpandedTags] = useState({}); // {equipmentId: true/false}
  // Delete confirmation state for info modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteAnim] = useState(new Animated.Value(0));

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
            style={[
              styles.addButton,
              {
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: "#4CAF50", // Green
                alignSelf: "center",
                marginLeft: 16,
                minWidth: 0,
              },
            ]}
            onPress={handleAddEquipment}
          >
            <Text
              style={[styles.buttonText, { fontWeight: "bold", fontSize: 15 }]}
            >
              + Werktuig toevoegen
            </Text>
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
                editable={!editMode} // Make name read-only when editing
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

              <Text style={styles.inputLabel}>Afbeelding *</Text>
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

      {/* Info Modal */}
      <Modal
        visible={infoModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {infoEquipment && (
              <ScrollView style={{ maxHeight: 300 }}>
                <Text
                  style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}
                >
                  {infoEquipment.type || infoEquipment.name}
                </Text>
                {infoEquipment.brand && (
                  <Text>Merk: {infoEquipment.brand}</Text>
                )}
                {infoEquipment.serialNumber && (
                  <Text>Serienummer: {infoEquipment.serialNumber}</Text>
                )}
                {infoEquipment.debiet && (
                  <Text>Debiet: {infoEquipment.debiet} l/min</Text>
                )}
                {infoEquipment.druk && (
                  <Text>Druk: {infoEquipment.druk} bar</Text>
                )}
                {infoEquipment.aantalKoppelingen && (
                  <Text>
                    Aantal koppelingen: {infoEquipment.aantalKoppelingen}
                  </Text>
                )}
                {/* Koppelingen/tags mapping, expandable */}
                {infoEquipment.tags &&
                  Object.keys(infoEquipment.tags).length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>Koppelingen:</Text>
                      {Object.entries(infoEquipment.tags)
                        .slice(
                          0,
                          expandedTags[infoEquipment.id] ? undefined : 4
                        )
                        .map(([key, value]) => (
                          <Text key={key}>
                            Koppeling {key}: {value}
                          </Text>
                        ))}
                      {Object.keys(infoEquipment.tags).length > 4 &&
                        !expandedTags[infoEquipment.id] && (
                          <TouchableOpacity
                            onPress={() =>
                              setExpandedTags((prev) => ({
                                ...prev,
                                [infoEquipment.id]: true,
                              }))
                            }
                          >
                            <Text style={{ color: "#2196F3", marginTop: 2 }}>
                              See more...
                            </Text>
                          </TouchableOpacity>
                        )}
                      {expandedTags[infoEquipment.id] && (
                        <TouchableOpacity
                          onPress={() =>
                            setExpandedTags((prev) => ({
                              ...prev,
                              [infoEquipment.id]: false,
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
              </ScrollView>
            )}
            {/* Action buttons stacked vertically */}
            <View style={{ marginTop: 24 }}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#4CAF50",
                    alignSelf: "center",
                    width: 240,
                    marginBottom: 12,
                  },
                ]}
                onPress={() => {
                  setModalVisible(true);
                  setEditMode(true);
                  setCurrentEquipment(infoEquipment);
                  setName(infoEquipment.name || "");
                  setType(infoEquipment.type || "");
                  setBrand(infoEquipment.brand || "");
                  setSerialNumber(infoEquipment.serialNumber || "");
                  setDebiet(
                    infoEquipment.debiet ? infoEquipment.debiet.toString() : ""
                  );
                  setDruk(
                    infoEquipment.druk ? infoEquipment.druk.toString() : ""
                  );
                  setAantalKoppelingen(
                    infoEquipment.aantalKoppelingen
                      ? infoEquipment.aantalKoppelingen.toString()
                      : ""
                  );
                  setTags(infoEquipment.tags || {});
                  setImageUri(infoEquipment.imageUri || "");
                  setInfoModalVisible(false);
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 17,
                    zIndex: 2,
                  }}
                >
                  Bewerken
                </Text>
              </TouchableOpacity>
              {/* Verwijderen button with confirmation and animated overlay */}
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#f44336",
                    alignSelf: "center",
                    width: 240,
                    marginBottom: 12,
                    overflow: "hidden",
                  },
                ]}
                onPress={async () => {
                  if (!infoEquipment) return; // Prevent null error
                  if (deleteConfirmId === infoEquipment.id) {
                    await handleDeleteEquipment(infoEquipment);
                    setInfoModalVisible(false);
                    setDeleteConfirmId(null);
                    deleteAnim.setValue(0);
                  } else {
                    setDeleteConfirmId(infoEquipment.id);
                    deleteAnim.setValue(0);
                    Animated.timing(deleteAnim, {
                      toValue: 1,
                      duration: 3000,
                      useNativeDriver: false,
                    }).start(() => {
                      setDeleteConfirmId(null);
                      deleteAnim.setValue(0);
                    });
                  }
                }}
                activeOpacity={0.8}
                disabled={!infoEquipment}
              >
                {infoEquipment && deleteConfirmId === infoEquipment.id && (
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: deleteAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["100%", "0%"],
                      }),
                      backgroundColor: "rgba(128,128,128,0.4)",
                      zIndex: 1,
                    }}
                  />
                )}
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 17,
                    zIndex: 2,
                  }}
                >
                  {infoEquipment && deleteConfirmId === infoEquipment.id
                    ? "Verwijderen bevestigen"
                    : "Verwijderen"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#FF9800",
                    alignSelf: "center",
                    width: 240,
                    marginBottom: 12,
                  },
                ]}
                onPress={() => {
                  setCurrentEquipment(infoEquipment);
                  setTags(infoEquipment.tags || {});
                  setScannedTags(infoEquipment.tags || {});
                  setAantalKoppelingen(
                    infoEquipment.aantalKoppelingen
                      ? infoEquipment.aantalKoppelingen.toString()
                      : ""
                  );
                  setScanningIndex(1);
                  setScanModalVisible(true);
                  setInfoModalVisible(false);
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 17,
                    zIndex: 2,
                  }}
                >
                  Scan koppelingen
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#2196F3",
                    alignSelf: "center",
                    width: 240,
                  },
                ]}
                onPress={() => setInfoModalVisible(false)}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 17,
                    zIndex: 2,
                  }}
                >
                  Sluiten
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
