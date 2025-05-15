import React, { useState } from "react";
import { View, Button, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { db } from "./Firebase";
import firestore from "@react-native-firebase/firestore";
import { collection, getDocs, limit, query } from "firebase/firestore";

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

  // Fetch first tractor from Firestore and set koppelingen
  const handleTractorPress = async () => {
  setLoadingTractor(true);
  try {
    const q = query(collection(db, "tractors"), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const koppelingen = doc.get("aantalKoppelingen") || 0;
      setTractorConnectors(koppelingen);
      setSelectedTractorName(doc.get("name") || "Onbekend");
    }
  } catch (error) {
    console.error("Error fetching tractor:", error);
  }
  setLoadingTractor(false);
};

const handleEquipmentPress = async () => {
  try {
    const q = query(collection(db, "equipment"), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const koppelingen = doc.get("aantalKoppelingen") || 0;
      setSelectedEquipmentName(doc.get("name") || "Onbekend");
      setEquipmentConnectors(koppelingen);
    }
  } catch (error) {
    console.error("Error fetching equipment:", error);
  }
};

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
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "flex-start" }}
              showsVerticalScrollIndicator={false}
              style={{ width: "100%" }}
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
                <View style={{ flex: 1 }}>
                  {/* Connected (blue) rows with ? button */}
                  {[...Array(Math.min(tractorConnectors, equipmentConnectors))].map((_, i) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      {/* Tractor ball */}
                      <View style={styles.connectorBallWithNumber}>
                        <Text style={styles.connectorBallNumber}>{i + 1}</Text>
                      </View>
                      {/* Line */}
                      <View style={{ width: 60, height: 4, backgroundColor: "#149cfb", borderRadius: 2, marginHorizontal: 8 }} />
                      {/* Equipment ball */}
                      <View style={styles.connectorBallWithNumber}>
                        <Text style={styles.connectorBallNumber}>{i + 1}</Text>
                      </View>
                      {/* Instructions button at the end of the row */}
                      <TouchableOpacity
                        style={[styles.instructionsButton, { marginLeft: 12 }]}
                        onPress={() => setInstructionsVisible(true)}
                      >
                        <Text style={styles.instructionsButtonText}>?</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Separator line after last blue row, but only if there are grey balls */}
                  {(tractorConnectors !== equipmentConnectors && Math.min(tractorConnectors, equipmentConnectors) > 0) && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      {/* Invisible left ball for alignment */}
                      <View style={[styles.connectorBallWithNumber, { opacity: 0 }]} />
                      {/* Long dashed separator */}
                      <View
                        style={{
                          flex: 1,
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
                  {tractorConnectors > equipmentConnectors &&
                    [...Array(tractorConnectors - equipmentConnectors)].map((_, i) => (
                      <View key={`tractor-grey-${i}`} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <View style={[styles.connectorBallWithNumber, styles.connectorBallGrey]}>
                          <Text style={styles.connectorBallNumber}>{equipmentConnectors + i + 1}</Text>
                        </View>
                      </View>
                    ))}
                  {/* Render excess grey balls for equipment */}
                  {equipmentConnectors > tractorConnectors &&
                    [...Array(equipmentConnectors - tractorConnectors)].map((_, i) => (
                      <View key={`equipment-grey-${i}`} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <View style={{ width: 28 }} /> {/* Empty space for alignment */}
                        <View style={{ width: 60 }} />
                        <View style={[styles.connectorBallWithNumber, styles.connectorBallGrey]}>
                          <Text style={styles.connectorBallNumber}>{tractorConnectors + i + 1}</Text>
                        </View>
                      </View>
                    ))}
                </View>
              </View>
              {/* Add more modal content here if needed */}
            </ScrollView>
            <View style={styles.closeButtonContainer}>
              <Button
                title="Sluiten"
                onPress={() => {
                  setModalVisible(false);
                  setTimeout(() => {
                    setTractorConnectors(0);
                    setEquipmentConnectors(0);
                    setSelectedTractorName("");
                    setSelectedEquipmentName("");
                  }, 300); // Wait for modal close animation
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Instructions Modal */}
      <Modal
        visible={instructionsVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setInstructionsVisible(false)}
      >
        <View style={styles.overlayBackground}>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instructies</Text>
            <Text style={styles.instructionsText}>
              Verbind de blauwe punten met elkaar. Zorg dat het aantal aansluitingen overeenkomt aan beide kanten. Grijze punten worden niet gebruikt.
            </Text>
            <View style={styles.instructionsImagePlaceholder} />
            <View style={{ marginTop: 24 }}>
              <Button title="Sluiten" onPress={() => setInstructionsVisible(false)} />
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
  alignSelf: "flex-start",
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