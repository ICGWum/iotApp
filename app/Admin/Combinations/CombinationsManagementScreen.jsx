import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import styles from "../../styles/combinatie";
import useCombinationsManagement from "./useCombinationsManagement";
import CombinationsHeader from "./CombinationsHeader";
import CombinationsList from "./CombinationsList";
import CombinationFormModal from "./CombinationFormModal";
import CombinationInfoModal from "./CombinationInfoModal";
import TractorSelectionModal from "./TractorSelectionModal";
import EquipmentSelectionModal from "./EquipmentSelectionModal";
import KoppelingMappingModal from "./KoppelingMappingModal";
import ConnectionMappingModal from "./ConnectionMappingModal";
import SettingsModal from "./SettingsModal";
import EyeModal from "./EyeModal";

export default function CombinationsManagementScreen({ navigation }) {
  const comb = useCombinationsManagement();

  if (comb.loading && comb.combinations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Combinaties laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CombinationsHeader onAdd={comb.handleAddCombination} />
      <CombinationsList
        combinations={comb.combinations}
        tractors={comb.tractors}
        onInfoPress={comb.handleEditCombination}
        onDelete={comb.handleDeleteCombination}
        onEye={comb.handleOpenEye}
        onSettings={comb.handleOpenSettings}
      />
      <CombinationFormModal {...comb} />
      <CombinationInfoModal {...comb} />
      <TractorSelectionModal
        tractorModalVisible={comb.tractorModalVisible}
        tractors={comb.tractors}
        setTractorModalVisible={comb.setTractorModalVisible}
        setSelectedTractorId={comb.setSelectedTractorId}
        setTractorPreview={comb.setTractorPreview}
      />
      {/* Only show EquipmentSelectionModal if you want the old flow, but for gear icon use SettingsModal */}
      <SettingsModal
        visible={comb.settingsModalVisible}
        tractor={comb.settingsTractor}
        equipment={comb.equipment}
        selectedWerktuigId={comb.selectedWerktuigId}
        onSelectWerktuig={comb.setSelectedWerktuigId}
        onCancel={() => comb.setSettingsModalVisible(false)}
        onCombine={comb.handleCombineWerktuig}
        combinations={comb.combinations} // pass all combinations for grey-out logic
      />
      <KoppelingMappingModal
        {...comb}
        onCancel={() => comb.setKoppelingMappingModalVisible(false)}
      />
      <ConnectionMappingModal {...comb} />
      <EyeModal
        visible={comb.eyeModalVisible}
        tractor={comb.eyeTractor}
        combination={comb.combinations.find(
          (c) => c.tractorId === comb.eyeTractor?.id
        )}
        equipment={comb.equipment}
        onClose={() => comb.setEyeModalVisible(false)}
        onDeleteWerktuig={comb.handleDeleteWerktuigFromCombination}
        onEditWerktuig={(werktuig) => {
          comb.setMappingWerktuig(werktuig);
          comb.setMappingTractor(comb.eyeTractor);
          comb.setKoppelingMappingModalVisible(true);
        }}
        onScanWerktuigNFC={comb.handleScanWerktuigNFC}
      />
    </View>
  );
}
