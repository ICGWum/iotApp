import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/tractor";

export default function TractorListItem({ item, onInfoPress }) {
  return (
    <View style={styles.tractorItem}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {item.imageUri && (
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
        )}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{ fontWeight: "bold", flexShrink: 1 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.brand} {item.model}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => onInfoPress(item)}
            style={{ marginLeft: 8, alignSelf: "center" }}
          >
            <Ionicons
              name="information-circle-outline"
              size={28}
              color="#2196F3"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
