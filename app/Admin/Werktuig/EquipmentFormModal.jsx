import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import styles from "../../styles/werktuig";

export default function EquipmentFormModal({
  modalVisible,
  editMode,
  name,
  setName,
  type,
  setType,
  brand,
  setBrand,
  serialNumber,
  setSerialNumber,
  debiet,
  setDebiet,
  druk,
  setDruk,
  aantalKoppelingen,
  setAantalKoppelingen,
  imageUri,
  handlePickImage,
  werktuigNfc,
  scanWerktuigNfc,
  onCancel = () => {},
  handleSaveEquipment,
}) {
  const handleNumberInput = (setter) => (val) => {
    const numeric = val.replace(/[^0-9.]/g, "");
    setter(numeric);
  };
  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editMode ? "Werktuig bewerken" : "Nieuw werktuig toevoegen"}
          </Text>
          <ScrollView
            style={styles.formContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.inputLabel}>Naam *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Voer naam werktuig in"
              editable={!editMode}
            />
            <Text style={styles.inputLabel}>Type *</Text>
            <TextInput
              style={styles.input}
              value={type}
              onChangeText={setType}
              placeholder="e.g. Pomp, Zaaimachine"
            />
            <Text style={styles.inputLabel}>Merk</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g. John Deere"
            />
            <Text style={styles.inputLabel}>Serienummer</Text>
            <TextInput
              style={styles.input}
              value={serialNumber}
              onChangeText={setSerialNumber}
              placeholder="e.g. SN1234"
            />
            <Text style={styles.inputLabel}>Debiet (l/min)</Text>
            <TextInput
              style={styles.input}
              value={debiet}
              onChangeText={handleNumberInput(setDebiet)}
              keyboardType="numeric"
              placeholder="Alleen cijfers"
            />
            <Text style={styles.inputLabel}>Druk (bar)</Text>
            <TextInput
              style={styles.input}
              value={druk}
              onChangeText={handleNumberInput(setDruk)}
              keyboardType="numeric"
              placeholder="Alleen cijfers"
            />
            <Text style={styles.inputLabel}>Aantal koppelingen</Text>
            <TextInput
              style={styles.input}
              value={aantalKoppelingen.toString()}
              onChangeText={(val) =>
                setAantalKoppelingen(Number(val.replace(/[^0-9]/g, "")))
              }
              keyboardType="numeric"
              placeholder="Alleen cijfers"
            />
            <Text style={styles.inputLabel}>Afbeelding *</Text>
            <TouchableOpacity
              style={{
                backgroundColor: imageUri ? "#4CAF50" : "#2196F3",
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
                marginBottom: 16,
              }}
              onPress={handlePickImage}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {imageUri ? "Afbeelding geselecteerd" : "Afbeelding uploaden"}
              </Text>
            </TouchableOpacity>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  alignSelf: "center",
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />
            ) : null}
            <Text style={styles.inputLabel}>Werktuig NFC *</Text>
            <TouchableOpacity
              style={{
                backgroundColor: werktuigNfc ? "#4CAF50" : "#2196F3",
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
                marginBottom: 16,
              }}
              onPress={scanWerktuigNfc}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {werktuigNfc ? `Gescand: ${werktuigNfc}` : "Scan werktuig NFC"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                onCancel();
              }}
            >
              <Text style={styles.buttonText}>Annuleren</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveEquipment}
            >
              <Text style={styles.buttonText}>Opslaan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
