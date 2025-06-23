import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import styles from "../../styles/tractor";

export default function TractorHeader({ onAdd }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.addButtonWide} onPress={onAdd}>
        <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
          + Tractor toevoegen
        </Text>
      </TouchableOpacity>
    </View>
  );
}
