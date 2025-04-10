import React from "react";
import { View, Button, Text, StyleSheet, ImageBackground } from "react-native";

export default function MedewerkerScreen({ navigation }) {
  return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welkom, Medewerker!</Text>
        <Text style={styles.subText}>Fijn om je te zien.</Text>
        <View style={{ marginVertical: 20 }} />
        <Button
          title="Ga naar Koppelen"
          onPress={() => navigation.navigate("Koppelen")}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 248, 248, 0.96)", // Adds a semi-transparent overlay
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginTop: 10,
  },
  bannerBottom: {
    height: 80, // Height of the blue rectangle
    backgroundColor: "#149cfb", // Color of the rectangle
    width: "100%", // Full width
    justifyContent: "center", // Center the text vertically
    alignItems: "center", // Center the text horizontally
  },
  footerText: {
    color: "#fff", // Text color
    fontSize: 16, // Font size
    textAlign: "center", // Center the text
  },
});