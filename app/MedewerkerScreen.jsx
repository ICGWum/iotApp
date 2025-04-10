import React from "react";
import { View, Button, Text, StyleSheet, ImageBackground } from "react-native";

// This is the main functional component for the MedewerkerScreen
export default function MedewerkerScreen({ navigation }) {
  return (
      <View style={styles.container}>
        {/* Welcome message */}
        <Text style={styles.welcomeText}>Welkom, Medewerker!</Text>
        <Text style={styles.subText}>Fijn om je te zien.</Text>
        
        {/* Spacer for vertical spacing */}
        <View style={{ marginVertical: 20 }} />
        
        {/* Button to navigate to the "Koppelen" screen */}
        <Button
          title="Ga naar Koppelen"
          onPress={() => navigation.navigate("Koppelen")}
        />

        {/* Button to navigate back to the "Home" screen */}
        <Button
          title="Logout"
          onPress={() => navigation.navigate("Home")}
        />
      </View>
  );
}

// Styles for the MedewerkerScreen component
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // Ensures the background image covers the entire screen
  },
  container: {
    flex: 1,
    justifyContent: "center", // Centers content vertically
    alignItems: "center", // Centers content horizontally
    backgroundColor: "rgba(248, 248, 248, 0.96)", // Adds a semi-transparent overlay
    padding: 20, // Adds padding around the content
  },
  welcomeText: {
    fontSize: 28, // Large font size for the welcome text
    fontWeight: "bold", // Bold font weight
    color: "black", // Black text color
    textAlign: "center", // Centers the text
  },
  subText: {
    fontSize: 16, // Smaller font size for the subtext
    color: "black", // Black text color
    textAlign: "center", // Centers the text
    marginTop: 10, // Adds spacing above the subtext
  },
  bannerBottom: {
    height: 80, // Height of the blue rectangle at the bottom
    backgroundColor: "#149cfb", // Blue background color
    width: "100%", // Full width of the screen
    justifyContent: "center", // Centers content vertically
    alignItems: "center", // Centers content horizontally
  },
  footerText: {
    color: "#fff", // White text color
    fontSize: 16, // Font size for the footer text
    textAlign: "center", // Centers the text
  },
});