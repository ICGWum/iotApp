import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import styles from "../../styles/werktuig";
import EquipmentHeader from "./EquipmentHeader";
import EquipmentList from "./EquipmentList";
import EquipmentFormModal from "./EquipmentFormModal";
import EquipmentInfoModal from "./EquipmentInfoModal";
import EquipmentScanModal from "./EquipmentScanModal";
import useEquipmentManagement from "./useEquipmentManagement";

export default function EquipmentManagementScreen({ navigation }) {
  const eq = useEquipmentManagement();

  if (eq.loading && eq.equipment.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Werktuigen laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EquipmentHeader onAdd={eq.handleAddEquipment} />
      <View style={{ flex: 1 }}>
        <EquipmentList
          equipment={eq.equipment}
          onInfoPress={eq.handleInfoEquipment}
        />
      </View>
      <EquipmentFormModal
        {...eq}
        werktuigNfc={eq.werktuigNfc}
        scanWerktuigNfc={eq.scanWerktuigNfc}
        onCancel={eq.resetForm}
      />
      <EquipmentInfoModal {...eq} />
      <EquipmentScanModal {...eq} />
    </View>
  );
}
