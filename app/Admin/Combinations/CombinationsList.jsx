import React from "react";
import { FlatList, View } from "react-native";
import CombinationItem from "./CombinationItem";
import styles from "../../styles/combinatie";

export default function CombinationsList({
  combinations,
  tractors,
  onInfoPress,
  onDelete,
  onEye,
  onSettings,
}) {
  return (
    <FlatList
      data={combinations}
      renderItem={({ item }) => (
        <CombinationItem
          item={item}
          tractors={tractors}
          onInfoPress={onInfoPress}
          onDelete={onDelete}
          onEye={onEye}
          onSettings={onSettings}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={true}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}
