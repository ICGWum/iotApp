import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import styles from "../../styles/tractor";
import TractorHeader from "./TractorHeader";
import TractorList from "./TractorList";
import TractorFormModal from "./TractorFormModal";
import TractorInfoModal from "./TractorInfoModal";
import TractorScanModal from "./TractorScanModal";
import useTractorManagement from "./useTractorManagement";

export default function TractorManagementScreen({ navigation }) {
  const tractor = useTractorManagement();

  if (tractor.loading && tractor.tractors.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Tractoren laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TractorHeader onAdd={tractor.handleAddTractor} />
      <TractorList
        tractors={tractor.tractors}
        onInfoPress={(item) => {
          tractor.setInfoTractor(item);
          tractor.setInfoModalVisible(true);
        }}
      />
      <TractorFormModal
        visible={tractor.modalVisible}
        editMode={tractor.editMode}
        name={tractor.name}
        setName={tractor.setName}
        brand={tractor.brand}
        setBrand={tractor.setBrand}
        model={tractor.model}
        setModel={tractor.setModel}
        serialNumber={tractor.serialNumber}
        setSerialNumber={tractor.setSerialNumber}
        power={tractor.power}
        setPower={tractor.setPower}
        year={tractor.year}
        setYear={tractor.setYear}
        aantalKoppelingen={tractor.aantalKoppelingen}
        setAantalKoppelingen={tractor.setAantalKoppelingen}
        imageUri={tractor.imageUri}
        handlePickImage={tractor.handlePickImage}
        tractorNfc={tractor.tractorNfc}
        scanTractorNfc={tractor.scanTractorNfc}
        onCancel={() => tractor.setModalVisible(false)}
        onSave={tractor.handleSaveTractor}
      />
      <TractorInfoModal
        visible={tractor.infoModalVisible}
        infoTractor={tractor.infoTractor}
        expandedTags={tractor.expandedTags}
        setExpandedTags={tractor.setExpandedTags}
        deleteConfirmId={tractor.deleteConfirmId}
        onEdit={() => {
          tractor.setInfoModalVisible(false);
          tractor.handleEditTractor(tractor.infoTractor);
        }}
        onDelete={() => {
          tractor.setInfoModalVisible(false);
          tractor.confirmDeleteTractor(tractor.infoTractor.id);
        }}
        onScan={() => {
          tractor.setInfoModalVisible(false);
          tractor.handleOpenScanModal(tractor.infoTractor);
        }}
        onClose={() => tractor.setInfoModalVisible(false)}
      />
      <TractorScanModal
        visible={tractor.scanModalVisible}
        scanTargetTractor={tractor.scanTargetTractor}
        scanningIndex={tractor.scanningIndex}
        scannedTags={tractor.scannedTags}
        onScan={tractor.scanNfcTag}
        onNext={() => tractor.setScanningIndex((prev) => prev + 1)}
        onSave={tractor.handleSaveScannedTags}
        onCancel={() => tractor.setScanModalVisible(false)}
      />
    </View>
  );
}
