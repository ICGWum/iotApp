import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import styles from "../../styles/werktuig";

export default function EquipmentInfoModal({
  infoModalVisible,
  infoEquipment,
  setInfoModalVisible,
  handleEditEquipment,
  confirmDeleteEquipment,
  expandedTags,
  setExpandedTags,
  deleteConfirmId,
  setDeleteConfirmId,
  deleteAnim,
  handleScanModalOpen,
}) {
  if (!infoEquipment) return null;
  return (
    <Modal
      visible={infoModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setInfoModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.modalTitle}>Werktuig informatie</Text>
            <Text>Naam: {infoEquipment.name}</Text>
            <Text>Type: {infoEquipment.type}</Text>
            <Text>Merk: {infoEquipment.brand}</Text>
            <Text>Serienummer: {infoEquipment.serialNumber}</Text>
            <Text>Debiet: {infoEquipment.debiet}</Text>
            <Text>Druk: {infoEquipment.druk}</Text>
            <Text>Aantal koppelingen: {infoEquipment.aantalKoppelingen}</Text>
            {infoEquipment.tag && (
              <Text>Werktuig NFC: {infoEquipment.tag}</Text>
            )}
            {infoEquipment.tags &&
              Object.keys(infoEquipment.tags).length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Koppelingen:</Text>
                  {Object.entries(infoEquipment.tags)
                    .slice(0, expandedTags[infoEquipment.id] ? undefined : 4)
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
            <View style={{ marginTop: 24, alignItems: "center" }}>
              <TouchableOpacity
                style={[styles.infoModalButton, { backgroundColor: "#4CAF50" }]}
                onPress={() => {
                  setInfoModalVisible(false);
                  handleEditEquipment(infoEquipment);
                }}
              >
                <Text style={styles.buttonText}>Bewerken</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.infoModalButton, { backgroundColor: "#f44336" }]}
                onPress={() => confirmDeleteEquipment(infoEquipment)}
              >
                <Text style={styles.buttonText}>Verwijderen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.infoModalButton, { backgroundColor: "#FFA500" }]}
                onPress={() => handleScanModalOpen(infoEquipment)}
              >
                <Text style={styles.buttonText}>Scan koppelingen</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.infoModalButton,
                {
                  backgroundColor: "#2196F3",
                  marginTop: 16,
                },
              ]}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text style={styles.buttonText}>Sluiten</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
