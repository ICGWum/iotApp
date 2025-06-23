import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import styles from "../../styles/tractor";

export default function TractorScanModal({
  visible,
  scanTargetTractor,
  scanningIndex,
  scannedTags,
  onScan,
  onNext,
  onSave,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
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
                onPress={async () => await onScan(scanningIndex)}
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
                  onPress={onCancel}
                >
                  <Text style={styles.buttonText}>Exit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    { flex: 1, marginLeft: 8 },
                  ]}
                  onPress={onNext}
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
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <TouchableOpacity
                  style={[styles.infoModalButton, styles.saveButton]}
                  onPress={onSave}
                >
                  <Text style={styles.buttonText}>Opslaan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.infoModalButton, styles.cancelButton]}
                  onPress={onCancel}
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
