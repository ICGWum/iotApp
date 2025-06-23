import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import styles from "../../styles/combinatie";

export default function EquipmentSelectionModal({
  visible,
  equipment,
  selectedEquipmentIds,
  onSelect,
  onClose,
  tractor,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecteer werktuigen</Text>
          {equipment.length === 0 ? (
            <View style={styles.emptySelectionList}>
              <Text>Geen werktuigen beschikbaar</Text>
              <Text>Voeg eerst werktuigen toe in werktuigbeheer</Text>
            </View>
          ) : (
            <FlatList
              data={equipment}
              renderItem={({ item }) => {
                const isCompatible =
                  tractor &&
                  item.aantalKoppelingen <= tractor.aantalKoppelingen;
                const incompatibleStyle = !isCompatible ? { opacity: 0.5 } : {};
                return (
                  <TouchableOpacity
                    style={[
                      styles.selectionItem,
                      selectedEquipmentIds.includes(item.id) &&
                        styles.selectedItem,
                      incompatibleStyle,
                    ]}
                    onPress={() => onSelect(item.id)}
                    disabled={!isCompatible}
                  >
                    <View style={styles.selectionItemContent}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text>Type: {item.type}</Text>
                      {item.brand && <Text>Merk: {item.brand}</Text>}
                      <Text>Aantal koppelingen: {item.aantalKoppelingen}</Text>
                      {!isCompatible && (
                        <Text style={styles.warningText}>
                          Niet compatibel - Werktuig heeft{" "}
                          {item.aantalKoppelingen} koppelingen nodig, tractor
                          heeft er minder
                        </Text>
                      )}
                    </View>
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedEquipmentIds.includes(item.id) &&
                            styles.checkboxSelected,
                        ]}
                      >
                        {selectedEquipmentIds.includes(item.id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id}
              style={styles.selectionList}
            />
          )}
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Gereed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
