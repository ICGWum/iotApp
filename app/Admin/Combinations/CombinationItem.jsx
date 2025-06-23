import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styles from "../../styles/combinatie";

export default function CombinationItem({ item, tractors, onEye, onSettings }) {
  const tractor = tractors.find((t) => t.id === item.tractorId);
  if (!tractor) return null;
  return (
    <View
      style={[
        styles.combinationItem,
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {tractor.imageUri ? (
          <Image
            source={{ uri: tractor.imageUri }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              marginRight: 16,
              backgroundColor: "#eee",
            }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
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
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>
            {tractor.name}
          </Text>
          <Text style={{ color: "#666", fontSize: 15 }}>
            {tractor.brand} {tractor.model}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => onEye(tractor)}>
        <Text style={{ fontSize: 28, marginLeft: 8, marginRight: 4 }}>👁️</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSettings(tractor)}>
        <Text style={{ fontSize: 32, marginLeft: 4 }}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}
