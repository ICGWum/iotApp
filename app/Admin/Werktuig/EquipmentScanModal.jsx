import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import styles from "../../styles/werktuig";

export default function EquipmentScanModal({
  scanModalVisible,
  currentEquipment,
  scanningIndex,
  scannedTags,
  setScanModalVisible,
  handleNfcScan,
  handleSaveScannedTags,
  handleNextScan,
}) {
  return (
    <Modal
      visible={scanModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setScanModalVisible(false)}
    >
      <View style={[styles.modalContainer, styles.alertForeground]}>
        <View style={styles.modalContent}>
          {currentEquipment &&
          scanningIndex <= parseInt(currentEquipment.aantalKoppelingen) ? (
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
                onPress={async () => await handleNfcScan()}
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
                  <Text style={styles.buttonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    { flex: 1, marginLeft: 8 },
                  ]}
                  onPress={handleNextScan}
                  disabled={!scannedTags[scanningIndex]}
                >
                  <Text style={styles.buttonText}>Volgende</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : currentEquipment ? (
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
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <TouchableOpacity
                  style={[styles.infoModalButton, styles.saveButton]}
                  onPress={handleSaveScannedTags}
                >
                  <Text style={styles.buttonText}>Opslaan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.infoModalButton, styles.cancelButton]}
                  onPress={() => setScanModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Annuleren</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
