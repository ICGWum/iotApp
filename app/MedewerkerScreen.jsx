import React, { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { db } from "./Firebase"; // Import your Firebase configuration
import { collection, getDocs, limit, query, doc, getDoc } from "firebase/firestore";
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import { Platform } from "react-native";

const tractorImg = { uri: "https://img.icons8.com/ios-filled/100/tractor.png" };
const equipmentImg = { uri: "https://img.icons8.com/ios-filled/100/plough.png" };

export default function MedewerkerScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tractorConnectors, setTractorConnectors] = useState(0); // default
  const [loadingTractor, setLoadingTractor] = useState(false);
  const [selectedTractorName, setSelectedTractorName] = useState("");
  const [selectedEquipmentName, setSelectedEquipmentName] = useState("");
  const [equipmentConnectors, setEquipmentConnectors] = useState(0);
  const separatorTop = Math.min(tractorConnectors, equipmentConnectors) * 44;
  const [instructionsVisible, setInstructionsVisible] = useState(false);

  const [tractorTags, setTractorTags] = useState([]);
  const [equipmentTags, setEquipmentTags] = useState([]);
  const [connectorMapping, setConnectorMapping] = useState([]); // Array of {tractor, werktuig}
  const [instructions, setInstructions] = useState({}); // { 'instructie-1': { img, text }, ... }
  const [selectedInstruction, setSelectedInstruction] = useState(null); // For modal per row

  const [userConnections, setUserConnections] = useState([]); // [{tractor: '1', equipment: '1'}, ...]
  const [currentConnectionIndex, setCurrentConnectionIndex] = useState(0);
  const [showNextPage, setShowNextPage] = useState(false);
  const [debiet, setDebiet] = useState(null);
  const [druk, setDruk] = useState(null);

  const allTractorNumbers = Array.from({ length: tractorConnectors }, (_, i) => (i + 1).toString());
  const allEquipmentNumbers = Array.from({ length: equipmentConnectors }, (_, i) => (i + 1).toString());
  const usedTractorNumbers = Object.keys(connectorMapping);
  const usedEquipmentNumbers = Object.values(connectorMapping).map(String);
  const unusedTractorNumbers = allTractorNumbers.filter(n => !usedTractorNumbers.includes(n));
  const unusedEquipmentNumbers = allEquipmentNumbers.filter(n => !usedEquipmentNumbers.includes(n));

  const [highlightedTractor, setHighlightedTractor] = useState(null);
  const [highlightedEquipment, setHighlightedEquipment] = useState(null);

  // Fetch first tractor from Firestore and set koppelingen
  const handleTractorPress = async () => {
  if (Platform.OS === "web") {
    alert("NFC werkt alleen op een mobiel apparaat.");
    return;
  }
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    await NfcManager.cancelTechnologyRequest();
    if (!tag || !tag.id) {
      alert("Geen NFC tag gevonden.");
      return;
    }
    // Search all tractors for a matching tag
    const q = query(collection(db, "tractors"));
    const snapshot = await getDocs(q);
    let found = false;
    snapshot.forEach((docSnap) => {
      if (docSnap.get("tag") === tag.id) {
        const koppelingen = docSnap.get("aantalKoppelingen") || 0;
        setTractorConnectors(koppelingen);
        setSelectedTractorName(docSnap.id);
        setTractorTags(docSnap.get("tags") || []);
        found = true;
      }
    });
    if (!found) {
      alert("Geen tractor gevonden met deze NFC tag.");
    }
  } catch (error) {
    await NfcManager.cancelTechnologyRequest();
    alert("Fout bij het scannen van NFC of ophalen van tractor.");
    console.error("Error fetching tractor:", error);
  }
  setLoadingTractor(false);
};

const handleEquipmentPress = async () => {
  if (Platform.OS === "web") {
    alert("NFC werkt alleen op een mobiel apparaat.");
    return;
  }
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    await NfcManager.cancelTechnologyRequest();
    if (!tag || !tag.id) {
      alert("Geen NFC tag gevonden.");
      return;
    }
    // Search all equipment for a matching tag
    const q = query(collection(db, "equipment"));
    const snapshot = await getDocs(q);
    let found = false;
    snapshot.forEach((docSnap) => {
      if (docSnap.get("tag") === tag.id) {
        const koppelingen = docSnap.get("aantalKoppelingen") || 0;
        setSelectedEquipmentName(docSnap.id);
        setEquipmentConnectors(koppelingen);
        setEquipmentTags(docSnap.get("tags") || []);
        found = true;
      }
    });
    if (!found) {
      alert("Geen apparaat gevonden met deze NFC tag.");
    }
  } catch (error) {
    await NfcManager.cancelTechnologyRequest();
    alert("Fout bij het scannen van NFC of ophalen van apparaat.");
    console.error("Error fetching equipment:", error);
  }
};


useEffect(() => {
  const fetchCombination = async () => {
    if (selectedTractorName && selectedEquipmentName) {
      try {
        const docRef = doc(db, "combinations", selectedTractorName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Get mapping object for this equipment
          const mappingRaw = docSnap.get(selectedEquipmentName) || {};
          // Convert {1: 1, 2: 5, 3: 6} to [["1", "1"], ["2", "5"], ["3", "6"]]
          const mapping = Object.entries(mappingRaw).map(([tractor, equipment]) => [
            tractor, // already a string
            equipment.toString(), // convert value to string
          ]);
          if (!mapping.length) {
            alert("Deze combinatie is niet beschikbaar.");
            setSelectedEquipmentName("");
            setEquipmentConnectors(0);
            setEquipmentTags([]);
            setConnectorMapping([]);
            setInstructions({});
            return;
          }
          setConnectorMapping(mapping);

          // Get instructions for this equipment
          const instructionsField = docSnap.get(selectedEquipmentName + "i") || {};
          setInstructions(instructionsField);
        } else {
          alert("Deze combinatie is niet beschikbaar.");
          setSelectedEquipmentName("");
          setEquipmentConnectors(0);
          setEquipmentTags([]);
          setConnectorMapping([]);
          setInstructions({});
        }
      } catch (error) {
        console.error("Error fetching combination/instructions:", error);
      }
    } else {
      setConnectorMapping([]);
      setInstructions({});
    }
  };
  fetchCombination();
}, [selectedTractorName, selectedEquipmentName]);

useEffect(() => {
  if (Platform.OS !== "web") {
    NfcManager.start();
  }
}, []);

console.log("connectorMapping", connectorMapping);
console.log("tractorConnectors", tractorConnectors, "equipmentConnectors", equipmentConnectors);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welkom, Medewerker!</Text>
      <Text style={styles.subText}>Fijn om je te zien.</Text>
      <View style={{ marginVertical: 20 }} />

      <View style={styles.centeredButtonContainer}>
        <Button title="Koppelen (Overlay)" onPress={() => setModalVisible(true)} />
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlayBackground}>
          <View style={styles.overlayContainer}>
            {showNextPage ? (
              <>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", width: "100%" }}>
                  <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 24 }}>Resultaten</Text>
                  <Text style={{ fontSize: 18, marginBottom: 12 }}>Debiet: {debiet ?? "Laden..."}</Text>
                  <Text style={{ fontSize: 18, marginBottom: 32 }}>Druk: {druk ?? "Laden..."}</Text>
                </View>
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  position: "absolute",
                  left: 24,
                  right: 24,
                  bottom: 24,
                }}>
                  <Button
                    title="Sluiten"
                    onPress={() => {
                      setModalVisible(false);
                      setTimeout(() => {
                        setTractorConnectors(0);
                        setEquipmentConnectors(0);
                        setSelectedTractorName("");
                        setSelectedEquipmentName("");
                        setUserConnections([]);
                        setCurrentConnectionIndex(0);
                        setShowNextPage(false);
                        setDebiet(null);
                        setDruk(null);
                      }, 300);
                    }}
                  />
                  <Button
                    title="Terug"
                    onPress={() => setShowNextPage(false)}
                  />
                </View>
              </>
            ) : (
              <>
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingBottom: 120,
                  }}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1, width: "100%" }}
                >
              {/* Top row: Tractor and Equipment buttons */}
              <View style={[styles.topRow, { flexWrap: "wrap" }]}>
                <TouchableOpacity style={styles.squareButton} onPress={handleTractorPress}>
                  <Image source={tractorImg} style={styles.buttonImage} />
                  <Text style={styles.buttonLabel}>Tractor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.squareButton} onPress={handleEquipmentPress}>
                  <Image source={equipmentImg} style={styles.buttonImage} />
                  <Text style={styles.buttonLabel}>Apparaat</Text>
                </TouchableOpacity>
              </View>

              {/* Names above balls */}
              <View style={styles.namesRow}>
                <Text style={styles.connectorNameText}>
                  {selectedTractorName || "Geen tractor geselecteerd"}
                </Text>
                <View style={{ width: 60 }} /> {/* Spacer for wire */}
                <Text style={styles.connectorNameText}>
                  {selectedEquipmentName || "Geen apparaat geselecteerd"}
                </Text>
              </View>

              {/* Connectors visualization with numbers */}
              <View style={styles.connectorsRow}>
                <View style={styles.connectorColumn}>
                  {/* Connected (blue) rows with ? button */}
                  {Object.entries(connectorMapping).map(([tractor, equipment], i) => {
                    const isConnected = userConnections.some(
                      (conn) => conn.tractor === tractor && conn.equipment === equipment
                    );
                    return (
                      <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        {/* Tractor ball */}
                        <View style={[
                          styles.connectorBallWithNumber,
                          isConnected && { backgroundColor: "green" },
                          highlightedTractor === i && { backgroundColor: "yellow" }
                        ]}>
                          <Text style={styles.connectorBallNumber}>{tractor}</Text>
                        </View>
                        {/* Line */}
                        <View style={{
                          width: 60,
                          height: 4,
                          backgroundColor: isConnected ? "green" : "#149cfb",
                          borderRadius: 2,
                          marginHorizontal: 8
                        }} />
                        {/* Equipment ball */}
                        <View style={[
                          styles.connectorBallWithNumber,
                          isConnected && { backgroundColor: "green" },
                          highlightedEquipment === i && { backgroundColor: "yellow" }
                        ]}>
                          <Text style={styles.connectorBallNumber}>{equipment}</Text>
                        </View>
                        {/* Instructions button */}
                        <TouchableOpacity
                          style={[styles.instructionsButton, { marginLeft: 12 }]}
                          onPress={() => setSelectedInstruction(i + 1)}
                        >
                          <Text style={styles.instructionsButtonText}>?</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  {/* Separator line after last blue row, but only if there are grey balls */}
                  {(tractorConnectors !== equipmentConnectors && Math.min(tractorConnectors, equipmentConnectors) > 0) && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      {/* Invisible left ball for alignment */}
                      <View style={[styles.connectorBallWithNumber, { opacity: 0 }]} />
                      {/* Long dashed separator */}
                      <View
                        style={{
                          height: 2,
                          borderBottomWidth: 2,
                          borderColor: "#bdbdbd",
                          borderStyle: "dashed",
                          marginHorizontal: 8,
                        }}
                      />
                      {/* Invisible right ball for alignment */}
                      <View style={[styles.connectorBallWithNumber, { opacity: 0 }]} />
                    </View>
                  )}

                  {/* Render excess grey balls for tractor */}
                  {unusedTractorNumbers.map((num, i) => (
                    <View key={`tractor-grey-${num}`} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <View style={[styles.connectorBallWithNumber, styles.connectorBallGrey]}>
                        <Text style={styles.connectorBallNumber}>{num}</Text>
                      </View>
                    </View>
                  ))}

                  {/* Render excess grey balls for equipment */}
                  {unusedEquipmentNumbers.map((num, i) => (
                    <View key={`equipment-grey-${num}`} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <View style={{ width: 28 }}></View>
                      <View style={{ width: 60 }}></View>
                      <View style={[styles.connectorBallWithNumber, styles.connectorBallGrey]}>
                        <Text style={styles.connectorBallNumber}>{num}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              {/* Add more modal content here if needed */}
              <Button
                title="verbinding"
                onPress={async () => {
                  if (Platform.OS === "web") {
                    alert("NFC werkt alleen op een mobiel apparaat.");
                    return;
                  }
                  try {
                    await NfcManager.requestTechnology(NfcTech.Ndef);
                    const tag = await NfcManager.getTag();
                    if (!tag || !tag.id) {
                      alert("Geen NFC tag gevonden.");
                      await NfcManager.cancelTechnologyRequest();
                      return;
                    }
                    // Find index in tractorTags or equipmentTags
                    const tractorIdx = tractorTags.indexOf(tag.id);
                    const equipmentIdx = equipmentTags.indexOf(tag.id);

                    if (tractorIdx !== -1) {
                      setHighlightedTractor(tractorIdx);
                      setHighlightedEquipment(null);
                      await NfcManager.cancelTechnologyRequest();
                      return;
                    }
                    if (equipmentIdx !== -1) {
                      setHighlightedEquipment(equipmentIdx);
                      setHighlightedTractor(null);
                      await NfcManager.cancelTechnologyRequest();
                      return;
                    }
                    alert("Tag niet gevonden in geselecteerde tractor of werktuig.");
                    setHighlightedTractor(null);
                    setHighlightedEquipment(null);
                    await NfcManager.cancelTechnologyRequest();
                  } catch (ex) {
                    await NfcManager.cancelTechnologyRequest();
                    alert("NFC scan geannuleerd of mislukt.");
                  }
                }}
              />
            </ScrollView>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 24,
            }}>
              <Button
                title="Sluiten"
                onPress={() => {
                  setModalVisible(false);
                  setTimeout(() => {
                    setTractorConnectors(0);
                    setEquipmentConnectors(0);
                    setSelectedTractorName("");
                    setSelectedEquipmentName("");
                    setUserConnections([]);
                    setCurrentConnectionIndex(0);
                    setShowNextPage(false);
                  }, 300);
                }}
              />
              <Button
                title="Volgende"
                onPress={async () => {
                  if (selectedEquipmentName) {
                    const docRef = doc(db, "equipment", selectedEquipmentName);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                      setDebiet(docSnap.get("debiet"));
                      setDruk(docSnap.get("druk"));
                    } else {
                      setDebiet("Onbekend");
                      setDruk("Onbekend");
                    }
                  }
                  setShowNextPage(true);
                }}
                disabled={
                  userConnections.length !== Object.entries(connectorMapping).length ||
                  !selectedTractorName ||
                  !selectedEquipmentName
                }
              />
            </View>
          </>
        )}
      </View>
    </View>
  </Modal>

      {/* Instructions Modal */}
      <Modal
        visible={selectedInstruction !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedInstruction(null)}
      >
        <View style={styles.overlayBackground}>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instructies</Text>
            <Text style={styles.instructionsText}>
              {instructions[`instructie-${selectedInstruction}`]?.[1] || "Geen instructie gevonden."}
            </Text>
            {instructions[`instructie-${selectedInstruction}`]?.[0] &&
              instructions[`instructie-${selectedInstruction}`][0].startsWith("http") ? (
                <Image
                  source={{ uri: instructions[`instructie-${selectedInstruction}`][0] }}
                  style={styles.instructionsImagePlaceholder}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.instructionsImagePlaceholder} />
              )
            }
            <View style={{ marginTop: 24 }}>
              <Button title="Sluiten" onPress={() => setSelectedInstruction(null)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Big red logout button at the bottom */}
      <Pressable
        style={styles.logoutButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(248, 248, 248, 0.96)",
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginTop: 10,
  },
  centeredButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxHeight: "90%", // Make modal longer
    minHeight: 560,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  closeButtonContainer: {
    width: "100%",
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  squareButton: {
    width: 90,
    height: 90,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  buttonImage: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  buttonLabel: {
    fontSize: 14,
    color: "#333",
  },
  connectorsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  connectorColumn: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  connectorBall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#149cfb",
    marginVertical: 8,
  },
  namesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  connectorNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    maxWidth: 90,
    textAlign: "center",
  },
  connectorBallWithNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#149cfb",
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  connectorBallGrey: {
    backgroundColor: "#bdbdbd",
  },
  separator: {
  width: 32,
  height: 2,
  borderBottomWidth: 2,
  borderColor: "#bdbdbd",
  borderStyle: "dashed",
  marginVertical: 6,
  alignSelf: "center",
  },
  linesColumn: {
  justifyContent: "space-between",
  alignItems: "center",
  marginHorizontal: 10,
  flex: 1,
  },
  connectorLine: {
    width: 60,
    height: 4,
    backgroundColor: "#149cfb",
    borderRadius: 2,
    marginVertical: 8,
  },
  connectorLineGrey: {
    backgroundColor: "#bdbdbd",
  },
  connectorBallNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  logoutButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#d32f2f",
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  instructionsButton: {
    marginLeft: 16,
    backgroundColor: "#149cfb",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  instructionsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
  },
  instructionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  instructionsText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 18,
    textAlign: "center",
  },
  instructionsImagePlaceholder: {
    width: 220,
    height: 140,
    backgroundColor: "#111",
    borderRadius: 12,
    marginBottom: 8,
  },
});