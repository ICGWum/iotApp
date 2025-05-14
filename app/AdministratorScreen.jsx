import React from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function AdministratorScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welkom, Beheerder!</Text>

      <ScrollView style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Machinebeheer</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("TractorManagement")}
        >
          <Text style={styles.menuTitle}>Tractorbeheer</Text>
          <Text style={styles.menuDescription}>
            Toevoegen, bewerken of verwijderen van tractoren
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("EquipmentManagement")}
        >
          <Text style={styles.menuTitle}>Werktuigbeheer</Text>
          <Text style={styles.menuDescription}>
            Toevoegen, bewerken of verwijderen van werktuigen
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Systeem</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("CombinatieConfig")}
        >
          <Text style={styles.menuTitle}>Combinatie Configuratie</Text>
          <Text style={styles.menuDescription}>
            Configureer systeemcombinaties
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("test_firestore")}
        >
          <Text style={styles.menuTitle}>Test Firestore</Text>
          <Text style={styles.menuDescription}>
            Test Firestore functionaliteit
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.logoutText}>Uitloggen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#555",
  },
  menuItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  menuDescription: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    margin: 16,
    backgroundColor: "#f44336",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
