import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import styles from "../../styles/combinatie";

export default function ConnectionMappingModal({
  connectionMappingModalVisible,
  currentMappingEquipment,
  selectedTractor,
  connectionMappings,
  onMap,
  onClose,
}) {
  if (!currentMappingEquipment || !selectedTractor) return null;
  const tractorConnections = Array.from(
    { length: selectedTractor.aantalKoppelingen },
    (_, i) => i + 1
  );
  const werktuigConnections = Array.from(
    { length: currentMappingEquipment.aantalKoppelingen },
    (_, i) => i + 1
  );
  const currentMappings = connectionMappings[currentMappingEquipment.id] || {};
  return (
    <Modal
      visible={connectionMappingModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.mappingHeaderContainer}>
            <Text style={styles.modalTitle}>Koppel de aansluitingen</Text>
            <Text style={styles.subtitle}>
              {currentMappingEquipment.name} - {selectedTractor.name}
            </Text>
          </View>
          <ScrollView
            style={styles.mappingContainer}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.mappingContentContainer}
          >
            {werktuigConnections.map((werktuigConn) => {
              const mappedTractorConn = currentMappings[werktuigConn];
              return (
                <View key={werktuigConn} style={styles.mappingRow}>
                  <View style={styles.mappingWerktuig}>
                    <Text style={styles.mappingLabel}>Werktuig</Text>
                    <View
                      style={[
                        styles.connectionBadge,
                        mappedTractorConn && styles.connectionBadgeMapped,
                      ]}
                    >
                      <Text
                        style={[
                          styles.connectionNumber,
                          mappedTractorConn && styles.connectionNumberMapped,
                        ]}
                      >
                        {werktuigConn}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.mappingArrowContainer}>
                    <Text style={styles.mappingArrow}>←→</Text>
                  </View>
                  <View style={styles.mappingTractor}>
                    <Text style={styles.mappingLabel}>Tractor</Text>
                    <View style={styles.tractorConnectionsGrid}>
                      {tractorConnections.map((tractorConn) => (
                        <TouchableOpacity
                          key={tractorConn}
                          style={[
                            styles.tractorConnectionButton,
                            currentMappings[werktuigConn] === tractorConn &&
                              styles.tractorConnectionButtonSelected,
                            Object.values(currentMappings).includes(
                              tractorConn
                            ) &&
                              currentMappings[werktuigConn] !== tractorConn &&
                              styles.tractorConnectionButtonUsed,
                          ]}
                          onPress={() => onMap(tractorConn, werktuigConn)}
                        >
                          <Text
                            style={[
                              styles.tractorConnectionNumber,
                              currentMappings[werktuigConn] === tractorConn &&
                                styles.tractorConnectionNumberSelected,
                            ]}
                          >
                            {tractorConn}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Gereed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
