import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import styles from "../../styles/combinatie";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

export default function CombinationFormModal({
  modalVisible,
  editMode,
  combinationName,
  setCombinationName,
  combinationDescription,
  setCombinationDescription,
  tractorPreview,
  setTractorModalVisible,
  handleSaveCombination,
  setModalVisible,
  handleCreateCombinationWithTractor,
  tractors,
  setSelectedTractorId,
  setTractorPreview,
}) {
  const [nfcLoading, setNfcLoading] = useState(false);

  // Helper to close both modals
  const handleClose = () => {
    setModalVisible(false);
    setTractorModalVisible(false);
  };

  // NFC scan handler
  const handleScanNfc = async () => {
    setNfcLoading(true);
    try {
      await NfcManager.start();
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      await NfcManager.cancelTechnologyRequest();
      if (tag && tag.id) {
        // Find tractor with matching tag
        const found = tractors.find((t) => t.tag === tag.id);
        if (found) {
          setSelectedTractorId(found.id);
          setTractorPreview(found);
        } else {
          alert("Geen tractor gevonden met deze NFC tag.");
        }
      } else {
        alert("Geen NFC tag gevonden.");
      }
    } catch (e) {
      alert("NFC scan mislukt of geannuleerd.");
    }
    setNfcLoading(false);
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editMode ? "Combinatie bewerken" : "Nieuwe combinatie toevoegen"}
          </Text>
          <ScrollView>
            <TextInput
              style={styles.input}
              placeholder="Naam combinatie"
              value={combinationName}
              onChangeText={setCombinationName}
            />
            <TextInput
              style={styles.input}
              placeholder="Beschrijving (optioneel)"
              value={combinationDescription}
              onChangeText={setCombinationDescription}
            />
            {tractorPreview && (
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                {tractorPreview.imageUri ? (
                  <Image
                    source={{ uri: tractorPreview.imageUri }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 16,
                      marginBottom: 12,
                      backgroundColor: "#eee",
                    }}
                    resizeMode="contain"
                  />
                ) : null}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginTop: 10,
                    marginBottom: 4,
                  }}
                >
                  {tractorPreview.brand} {tractorPreview.model}
                </Text>
                <Text style={{ color: "#666", fontSize: 16 }}>
                  {tractorPreview.name}
                </Text>
              </View>
            )}
          </ScrollView>
          <View style={styles.modalActionsVertical}>
            <TouchableOpacity
              style={[styles.modalButton, styles.blueButton]}
              onPress={() => setTractorModalVisible(true)}
            >
              <Text style={styles.buttonText}>Selecteer een tractor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.blueButton]}
              onPress={handleScanNfc}
              disabled={nfcLoading}
            >
              <Text style={styles.buttonText}>
                {nfcLoading ? "Scannen..." : "Scan Tractor NFC"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={
                editMode
                  ? handleSaveCombination
                  : handleCreateCombinationWithTractor
              }
            >
              <Text style={styles.buttonText}>
                {editMode ? "Opslaan" : "Aanmaken"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.redButton]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Annuleren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
