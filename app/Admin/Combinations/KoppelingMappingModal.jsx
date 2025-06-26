import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, Alert } from "react-native";
import styles from "../../styles/combinatie";
import useTractorManagement from "../Tractor/useTractorManagement";
import useEquipmentManagement from "../Werktuig/useEquipmentManagement";

export default function KoppelingMappingModal({
  koppelingMappingModalVisible,
  mappingTractor,
  mappingWerktuig,
  mappingPairs,
  onCancel,
  onSave,
}) {
  // State for scan step and mapping
  const [scanStep, setScanStep] = useState(0); // 0: tractor, 1: werktuig
  const [pendingTractorIdx, setPendingTractorIdx] = useState(null); // index of tractor koppeling being mapped
  const [pendingTractorTag, setPendingTractorTag] = useState(null); // nfc tag of tractor koppeling being mapped
  const [mappedPairs, setMappedPairs] = useState([]); // [{tractorIdx, werktuigIdx, tractorTag, werktuigTag}]
  const [highlighted, setHighlighted] = useState({}); // {tractor: [idx], werktuig: [idx]}
  const { tractors, scanTractorNfc } = useTractorManagement();
  const { equipment, scanWerktuigNfc } = useEquipmentManagement();

  if (!mappingTractor || !mappingWerktuig) return null;

  // Helper: get koppelingen array from tractor/equipment
  const getTractorKoppelingen = () => mappingTractor.koppelingen || [];
  const getWerktuigKoppelingen = () => mappingWerktuig.koppelingen || [];

  // Helper: check if a koppeling index is already mapped
  const isMapped = (tractorIdx, werktuigIdx) =>
    mappedPairs.some(
      (pair) =>
        pair.tractorIdx === tractorIdx || pair.werktuigIdx === werktuigIdx
    );

  // Scan logic
  const handleScan = async () => {
    if (scanStep === 0) {
      // Scan tractor koppeling
      try {
        const tag = await scanTractorNfc(); // should return tag object or tag id
        // Find which koppeling (by index) matches this tag
        const koppelingen = getTractorKoppelingen();
        const idx = koppelingen.findIndex((k) => k.nfcTag === (tag?.id || tag));
        if (idx !== -1 && !isMapped(idx, null)) {
          setPendingTractorIdx(idx);
          setPendingTractorTag(tag?.id || tag);
          setHighlighted({ tractor: idx });
          Alert.alert("Tractor koppeling gevonden");
          setScanStep(1);
        } else {
          Alert.alert("Geen tractor koppeling gevonden of al gekoppeld");
        }
      } catch (e) {
        Alert.alert("Scan geannuleerd of mislukt");
      }
    } else if (scanStep === 1 && pendingTractorIdx !== null) {
      // Scan werktuig koppeling
      try {
        const tag = await scanWerktuigNfc();
        const koppelingen = getWerktuigKoppelingen();
        const idx = koppelingen.findIndex((k) => k.nfcTag === (tag?.id || tag));
        if (idx !== -1 && !isMapped(null, idx)) {
          // Save this pair
          setMappedPairs((prev) => [
            ...prev,
            {
              tractorIdx: pendingTractorIdx,
              werktuigIdx: idx,
              tractorTag: pendingTractorTag,
              werktuigTag: tag?.id || tag,
            },
          ]);
          setHighlighted({ tractor: pendingTractorIdx, werktuig: idx });
          Alert.alert("Werktuig koppeling gevonden");
          // Reset for next pair
          setScanStep(0);
          setPendingTractorIdx(null);
          setPendingTractorTag(null);
        } else {
          Alert.alert("Geen werktuig koppeling gevonden of al gekoppeld");
        }
      } catch (e) {
        Alert.alert("Scan geannuleerd of mislukt");
      }
    }
  };

  // Save all mapped pairs
  const handleSave = () => {
    if (mappedPairs.length === 0) {
      Alert.alert("Geen koppelingen om op te slaan");
      return;
    }
    // Build mapping object: { tractorKoppelingNum: werktuigKoppelingNum }
    const mapping = {};
    mappedPairs.forEach((pair) => {
      mapping[pair.tractorIdx + 1] = pair.werktuigIdx + 1; // +1 for display numbering
    });
    onSave(mapping);
    setMappedPairs([]);
    setHighlighted({});
    setScanStep(0);
    setPendingTractorIdx(null);
    setPendingTractorTag(null);
  };

  // UI coloring logic
  const getTractorColor = (idx) => {
    const mapped = mappedPairs.find((p) => p.tractorIdx === idx);
    if (mapped) return "#4caf50"; // green
    if (highlighted.tractor === idx && scanStep === 1) return "orange";
    return "#f2f2f2";
  };
  const getWerktuigColor = (idx) => {
    const mapped = mappedPairs.find((p) => p.werktuigIdx === idx);
    if (mapped) return "#4caf50"; // green
    if (highlighted.werktuig === idx) return "#4caf50";
    return "#f2f2f2";
  };

  return (
    <Modal
      visible={koppelingMappingModalVisible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            width: 370,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            Koppelingen scannen
          </Text>
          <Text
            style={{
              color: "#666",
              marginBottom: 22,
              textAlign: "center",
              fontSize: 16,
            }}
          >
            {mappingTractor.name} ↔ {mappingWerktuig.name}
          </Text>
          <View style={{ width: "100%", marginBottom: 18 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{ fontWeight: "bold", fontSize: 16, marginBottom: 6 }}
                >
                  Tractor
                </Text>
                {Array.from(
                  { length: mappingTractor.aantalKoppelingen || 0 },
                  (_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: getTractorColor(i),
                        justifyContent: "center",
                        alignItems: "center",
                        marginVertical: 4,
                        marginBottom: 6,
                        borderWidth: 1,
                        borderColor: "#ddd",
                      }}
                    >
                      <Text style={{ fontSize: 17, color: "#333" }}>
                        {i + 1}
                      </Text>
                    </View>
                  )
                )}
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "#aaa", fontSize: 15, marginVertical: 8 }}
                >
                  Nog geen koppelingen
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{ fontWeight: "bold", fontSize: 16, marginBottom: 6 }}
                >
                  Werktuig
                </Text>
                {Array.from(
                  { length: mappingWerktuig.aantalKoppelingen || 0 },
                  (_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: getWerktuigColor(i),
                        justifyContent: "center",
                        alignItems: "center",
                        marginVertical: 4,
                        marginBottom: 6,
                        borderWidth: 1,
                        borderColor: "#ddd",
                      }}
                    >
                      <Text style={{ fontSize: 17, color: "#333" }}>
                        {i + 1}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>
          <View style={{ width: "100%", marginTop: 18 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#4caf50",
                borderRadius: 8,
                paddingVertical: 14,
                marginBottom: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handleScan}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Scan Koppeling
              </Text>
            </TouchableOpacity>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#e53935",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={onCancel}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Annuleren
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#4caf50",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={handleSave}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Opslaan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
