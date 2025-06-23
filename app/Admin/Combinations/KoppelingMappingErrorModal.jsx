import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/combinatie";

export default function KoppelingMappingErrorModal({
  koppelingMappingError,
  koppelingMappingModalVisible,
  onClose,
}) {
  if (!koppelingMappingError) return null;
  return (
    <Modal
      visible={koppelingMappingModalVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
            padding: 32,
            width: 340,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 16 }}>
            Ongeldige koppeling selectie
          </Text>
          <Text style={{ textAlign: "center", marginBottom: 24 }}>
            {koppelingMappingError}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#888",
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 32,
            }}
            onPress={onClose}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Sluiten</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
