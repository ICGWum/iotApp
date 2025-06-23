import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/combinatie";

export default function KoppelingMappingModal({
  koppelingMappingModalVisible,
  mappingTractor,
  mappingWerktuig,
  mappingPairs,
  onCancel,
  onSave,
}) {
  if (!mappingTractor || !mappingWerktuig) return null;
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
          {/* Mapping pairs UI would go here */}
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
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 6,
                  }}
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
                        backgroundColor: "#f2f2f2",
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
                {/* Centered message if no koppelingen mapped */}
                <Text
                  style={{
                    color: "#aaa",
                    fontSize: 15,
                    marginVertical: 8,
                  }}
                >
                  Nog geen koppelingen
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 6,
                  }}
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
                        backgroundColor: "#f2f2f2",
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
              onPress={() => {}}
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
                onPress={onSave}
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
