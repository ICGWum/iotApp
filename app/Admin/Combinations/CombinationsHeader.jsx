import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import styles from "../../styles/combinatie";

export default function CombinatieHeader({ onAdd }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.addButton, { minWidth: 180, borderRadius: 20 }]}
        onPress={onAdd}
      >
        <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
          + Combinatie toevoegen
        </Text>
      </TouchableOpacity>
    </View>
  );
}
