import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import styles from "../../styles/combinatie";

export default function EyeModal({
  visible,
  tractor,
  combination,
  equipment,
  onClose,
  onDeleteWerktuig,
  onEditWerktuig,
  onScanWerktuigNFC,
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  if (!visible || !tractor) return null;
  const gekoppeldeWerktuigen =
    combination && combination.equipmentIds ? combination.equipmentIds : [];

  const confirmDelete = (werktuig) => {
    Alert.alert(
      "Bevestig verwijdering",
      `Weet je zeker dat je werktuig '${werktuig.name}' wilt verwijderen?`,
      [
        {
          text: "Annuleren",
          style: "cancel",
          onPress: () => setPendingDeleteId(null),
        },
        {
          text: "Verwijder",
          style: "destructive",
          onPress: () => {
            setPendingDeleteId(null);
            onDeleteWerktuig(werktuig.id);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Gekoppelde werktuigen voor {tractor.name}
          </Text>
          {gekoppeldeWerktuigen.length === 0 ? (
            <View style={styles.emptySelectionList}>
              <Text>Geen gekoppelde werktuigen</Text>
            </View>
          ) : (
            <FlatList
              data={gekoppeldeWerktuigen}
              keyExtractor={(id) => id}
              renderItem={({ item }) => {
                const werktuig = equipment.find((e) => e.id === item);
                if (!werktuig) return null;
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                      backgroundColor: "#f9f9f9",
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    {werktuig.imageUri ? (
                      <Image
                        source={{ uri: werktuig.imageUri }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          marginRight: 12,
                          backgroundColor: "#eee",
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          backgroundColor: "#eee",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text>Geen</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {werktuig.type}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 15 }}>
                        {werktuig.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{ marginLeft: 8 }}
                      onPress={() => onEditWerktuig && onEditWerktuig(werktuig)}
                    >
                      <Text style={{ fontSize: 22, color: "#1976D2" }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginLeft: 8 }}
                      onPress={() => confirmDelete(werktuig)}
                    >
                      <Text style={{ fontSize: 22, color: "#e53935" }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              style={{ marginBottom: 18, marginTop: 8 }}
            />
          )}
          <TouchableOpacity
            style={[
              styles.modalButton,
              { backgroundColor: "#1976D2", marginBottom: 10 },
            ]}
            onPress={onScanWerktuigNFC}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              Scan werktuig NFC
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: "#e53935" }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Sluiten</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
