import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/werktuig";

export default function EquipmentHeader({ onAdd }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.addButtonWide} onPress={onAdd}>
        <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
          + Werktuig toevoegen
        </Text>
      </TouchableOpacity>
    </View>
  );
}
