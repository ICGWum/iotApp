import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/combinatie";

export default function CombinationInfoModal({
  infoModalVisible,
  currentCombination,
  setInfoModalVisible,
}) {
  if (!currentCombination) return null;
  return (
    <Modal
      visible={infoModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setInfoModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Combinatie info</Text>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>
            {currentCombination.name}
          </Text>
          <Text style={{ color: "#666", marginBottom: 12 }}>
            {currentCombination.description}
          </Text>
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setInfoModalVisible(false)}
          >
            <Text style={styles.buttonText}>Sluiten</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
