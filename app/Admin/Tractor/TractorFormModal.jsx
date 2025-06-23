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
import styles from "../../styles/tractor";

export default function TractorFormModal({
  visible,
  editMode,
  name,
  setName,
  brand,
  setBrand,
  model,
  setModel,
  serialNumber,
  setSerialNumber,
  power,
  setPower,
  year,
  setYear,
  aantalKoppelingen,
  setAantalKoppelingen,
  imageUri,
  handlePickImage,
  tractorNfc,
  scanTractorNfc,
  onCancel,
  onSave,
}) {
  // Helper to allow only numbers
  const handleNumberInput = (setter) => (val) => {
    // Remove all non-digit characters
    const numeric = val.replace(/[^0-9]/g, "");
    setter(numeric);
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editMode ? "Tractor bewerken" : "Nieuwe tractor toevoegen"}
          </Text>
          <ScrollView style={styles.formContainer}>
            <Text style={styles.inputLabel}>Naam *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Voer naam tractor in"
            />
            <Text style={styles.inputLabel}>Merk *</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g. John Deere, Fendt"
            />
            <Text style={styles.inputLabel}>Model *</Text>
            <TextInput
              style={styles.input}
              value={model}
              onChangeText={setModel}
              placeholder="e.g. 6120R"
            />
            <Text style={styles.inputLabel}>Serienummer</Text>
            <TextInput
              style={styles.input}
              value={serialNumber}
              onChangeText={setSerialNumber}
              placeholder="e.g. SN1234"
            />
            <Text style={styles.inputLabel}>Vermogen (pk) *</Text>
            <TextInput
              style={styles.input}
              value={power}
              onChangeText={handleNumberInput(setPower)}
              keyboardType="numeric"
              placeholder="Alleen cijfers"
              maxLength={5}
            />
            <Text style={styles.inputLabel}>Bouwjaar *</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={handleNumberInput(setYear)}
              keyboardType="numeric"
              placeholder="Alleen cijfers"
              maxLength={4}
            />
            <Text style={styles.inputLabel}>Aantal koppelingen *</Text>
            <TextInput
              style={styles.input}
              value={aantalKoppelingen}
              onChangeText={handleNumberInput(setAantalKoppelingen)}
              keyboardType="numeric"
              placeholder="Alleen cijfers"
              maxLength={2}
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
            <Text style={styles.inputLabel}>Tractor NFC *</Text>
            <TouchableOpacity
              style={{
                backgroundColor: tractorNfc ? "#4CAF50" : "#2196F3",
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
                marginBottom: 16,
              }}
              onPress={scanTractorNfc}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {tractorNfc ? `Gescand: ${tractorNfc}` : "Scan tractor NFC"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { flex: 1, marginRight: 8 },
              ]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Annuleren</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                { flex: 1, marginLeft: 8 },
              ]}
              onPress={onSave}
            >
              <Text style={styles.buttonText}>Opslaan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
