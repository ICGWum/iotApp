import React from "react";
import { View, Text, FlatList } from "react-native";
import styles from "../../styles/werktuig";
import EquipmentListItem from "./EquipmentListItem";

export default function EquipmentList({ equipment, onInfoPress }) {
  if (equipment.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Geen werktuigen gevonden</Text>
        <Text>Voeg je eerste werktuig toe met de knop hierboven</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={equipment}
      renderItem={({ item }) => (
        <EquipmentListItem item={item} onInfoPress={onInfoPress} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
    />
  );
}
