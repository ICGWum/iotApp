import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import styles from "../../styles/combinatie";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

export default function SettingsModal({
  visible,
  tractor,
  equipment,
  selectedWerktuigId,
  onSelectWerktuig,
  onCancel,
  onCombine,
  combinations,
}) {
  // All hooks must be at the top, before any return!
  const [nfcLoading, setNfcLoading] = useState(false);
  const currentCombination = useMemo(
    () => combinations?.find((c) => c.tractorId === tractor?.id),
    [combinations, tractor]
  );
  const alreadyCombinedIds = useMemo(() => {
    if (!currentCombination) return [];
    if (Array.isArray(currentCombination.equipmentIds)) {
      return currentCombination.equipmentIds;
    }
    return Object.keys(currentCombination).filter((k) =>
      k.startsWith("werktuig-")
    );
  }, [currentCombination]);

  if (!tractor) return null;

  const compatibleWerktuigen = equipment.filter(
    (w) => w.aantalKoppelingen <= tractor.aantalKoppelingen && w.id && w.name
  );

  // NFC scan handler for werktuig
  const handleScanNfc = async () => {
    setNfcLoading(true);
    try {
      await NfcManager.start();
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      await NfcManager.cancelTechnologyRequest();
      if (tag && tag.id) {
        // Find werktuig with matching tag
        const found = equipment.find(
          (w) => Object.values(w.tags || {}).includes(tag.id)
        );
        if (found) {
          onSelectWerktuig(found.id);
        } else {
          alert("Geen werktuig gevonden met deze NFC tag.");
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
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Werktuig koppelen aan {tractor.name}
          </Text>
          <FlatList
            data={compatibleWerktuigen}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isCombined =
                alreadyCombinedIds.includes(item.id) ||
                alreadyCombinedIds.includes(item.name);
              return (
                <TouchableOpacity
                  style={[
                    styles.selectionItem,
                    selectedWerktuigId === item.id && styles.selectedItem,
                    isCombined && { opacity: 0.5 },
                  ]}
                  onPress={() => !isCombined && onSelectWerktuig(item.id)}
                  disabled={isCombined}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          marginRight: 16,
                          backgroundColor: "#eee",
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          backgroundColor: "#eee",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <Text>Geen</Text>
                      </View>
                    )}
                    <View>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 14 }}>
                        {item.type}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            style={{ maxHeight: 300, marginBottom: 16 }}
          />
          <View style={styles.modalActionsVertical}>
            <TouchableOpacity
              style={[styles.modalButton, styles.blueButton]}
              onPress={handleScanNfc}
              disabled={nfcLoading}
            >
              <Text style={styles.buttonText}>
                {nfcLoading ? "Scannen..." : "Scan werktuig NFC"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                { opacity: selectedWerktuigId ? 1 : 0.5 },
              ]}
              disabled={!selectedWerktuigId}
              onPress={onCombine}
            >
              <Text style={styles.buttonText}>Combineer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Annuleren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
