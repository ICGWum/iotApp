import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import styles from "../../styles/combinatie";

export default function TractorSelectionModal({
  tractorModalVisible,
  tractors,
  setTractorModalVisible,
  setSelectedTractorId,
  setTractorPreview,
}) {
  // Only open if tractorModalVisible is true
  const handleClose = () => {
    setTractorModalVisible(false);
  };
  const handleSelect = (item) => {
    setSelectedTractorId(item.id);
    setTractorPreview(item);
    setTractorModalVisible(false);
  };
  return (
    <Modal
      visible={tractorModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecteer een tractor</Text>
          {tractors.length === 0 ? (
            <View style={styles.emptySelectionList}>
              <Text>Geen tractoren beschikbaar</Text>
              <Text>Voeg eerst tractoren toe in tractorbeheer</Text>
            </View>
          ) : (
            <FlatList
              data={tractors}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectionItem}
                  onPress={() => handleSelect(item)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
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
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 14 }}>
                        {item.brand} {item.model}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              style={styles.selectionList}
            />
          )}
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={handleClose}
          >
            <Text style={styles.buttonText}>Sluiten</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
