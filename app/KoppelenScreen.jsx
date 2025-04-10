import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

const trekkerOptions = ["Trekker A", "Trekker B", "Trekker C"];
const koppelingOptions = ["Koppeling A", "Koppeling B", "Koppeling C"];

const KoppelenScreen = () => {
  const navigation = useNavigation();

  const [showTrekkerList, setShowTrekkerList] = useState(false);
  const [showKoppelingList, setShowKoppelingList] = useState(false);

  const [selectedTrekker, setSelectedTrekker] = useState("");
  const [selectedKoppeling, setSelectedKoppeling] = useState("");

  const handleConfirm = () => {
    if (!selectedTrekker || !selectedKoppeling) {
      Alert.alert("Selecteer eerst een trekker en een koppeling");
      return;
    }
    navigation.navigate("KoppelingTutorial", {
      trekker: selectedTrekker,
      koppeling: selectedKoppeling,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.chooseOption}>Kies een optie:</Text>

      {/* Trekker Selectie */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowTrekkerList(!showTrekkerList)}
      >
        <Text style={styles.buttonText}>
          {selectedTrekker
            ? `Trekker: ${selectedTrekker}`
            : "Selecteer een trekker"}
        </Text>
      </TouchableOpacity>
      {showTrekkerList && (
        <FlatList
          data={trekkerOptions}
          keyExtractor={(item) => item}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                setSelectedTrekker(item);
                setShowTrekkerList(false);
              }}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Koppeling Selectie */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowKoppelingList(!showKoppelingList)}
      >
        <Text style={styles.buttonText}>
          {selectedKoppeling
            ? `Koppeling: ${selectedKoppeling}`
            : "Selecteer een koppeling"}
        </Text>
      </TouchableOpacity>
      {showKoppelingList && (
        <FlatList
          data={koppelingOptions}
          keyExtractor={(item) => item}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                setSelectedKoppeling(item);
                setShowKoppelingList(false);
              }}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bevestig Knop */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          !(selectedTrekker && selectedKoppeling) && {
            backgroundColor: "#ccc",
          },
        ]}
        onPress={handleConfirm}
        disabled={!(selectedTrekker && selectedKoppeling)}
      >
        <Text style={styles.confirmButtonText}>Bevestigen</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2196f3",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    marginTop: 50,
    width: "80%",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  chooseOption: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  list: {
    maxHeight: 120,
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
});

export default KoppelenScreen;
