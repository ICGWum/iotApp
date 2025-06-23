import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import styles from "../../styles/tractor";

export default function TractorInfoModal({
  visible,
  infoTractor,
  expandedTags,
  setExpandedTags,
  deleteConfirmId,
  onEdit,
  onDelete,
  onScan,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
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
              <Text>Vermogen: {infoTractor.power}</Text>
              <Text>Bouwjaar: {infoTractor.year}</Text>
              <Text>Aantal koppelingen: {infoTractor.aantalKoppelingen}</Text>
              {infoTractor.tag && <Text>Tractor NFC: {infoTractor.tag}</Text>}
              {/* Koppelingen/tags mapping, expandable */}
              {infoTractor.tags && Object.keys(infoTractor.tags).length > 0 && (
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
                  onPress={onEdit}
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
                  onPress={onDelete}
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
                  onPress={onScan}
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
                onPress={onClose}
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
  );
}
