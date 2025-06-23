import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/werktuig";

export default function EquipmentListItem({ item, onInfoPress }) {
  return (
    <View style={styles.equipmentItem}>
      {item.imageUri ? (
        <Image
          source={{ uri: item.imageUri }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            backgroundColor: "#eee",
            marginRight: 12,
            alignSelf: "center",
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            marginRight: 12,
            backgroundColor: "#f2f2f2",
          }}
        />
      )}
      <Text style={{ flex: 1, fontWeight: "bold", fontSize: 16 }}>
        {item.type ? item.type : item.name}
      </Text>
      <TouchableOpacity
        onPress={() => onInfoPress(item)}
        style={{ padding: 4 }}
      >
        <Ionicons name="information-circle-outline" size={24} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );
}
