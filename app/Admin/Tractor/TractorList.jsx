import React from "react";
import { View, Text, FlatList } from "react-native";
import styles from "../../styles/tractor";
import TractorListItem from "./TractorListItem";

export default function TractorList({ tractors, onInfoPress }) {
  if (tractors.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Geen tractoren gevonden</Text>
        <Text>Voeg je eerste tractor toe met de knop hierboven</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={tractors}
      renderItem={({ item }) => (
        <TractorListItem item={item} onInfoPress={onInfoPress} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
    />
  );
}
