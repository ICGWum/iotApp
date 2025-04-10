// In your index file
import React from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import MedewerkerScreen from "./MedewerkerScreen";
import AdministratorScreen from "./AdministratorScreen";
import KoppelenScreen from "./KoppelenScreen";
import CombinatieConfig from "./CombinatieConfig";
import Banner from "./Banner";
import KoppelingTutorial from "./KoppelingTutorial";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Banner /> {/* Add the Banner component here */}
      <View style={styles.buttonContainer}>
        <Text style={styles.signInText}>Inloggen</Text> {/* Add Sign in text */}
        <View style={{ marginVertical: 20 }} />{" "}
        {/* Space between text and buttons */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Medewerker"
            onPress={() => navigation.navigate("Medewerker")}
          />
        </View>
        <View style={{ marginVertical: 10 }} />
        <View style={styles.buttonWrapper}>
          <Button
            title="Administrator"
            onPress={() => navigation.navigate("Administrator")}
          />
        </View>
      </View>
      <View style={styles.bannerBottom}>
        <Text style={styles.footerText}>© 2025 Team B2</Text> {/* Add footer text */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50, // Move the container up by adjusting this value
  },
  signInText: {
    fontSize: 24, // Adjust font size as needed
    fontWeight: "bold", // Make the text bold
    marginBottom: 20, // Space below the text
  },
  buttonWrapper: {
    width: "80%", // Set a fixed width for the buttons
    borderRadius: 5, // Optional: Add border radius for rounded corners
    overflow: "hidden", // Ensure the button respects the border radius
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

export default function App() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerBackTitleVisible: false, // Hide the back button text
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false, // No header for the Home screen
        }}
      />
      <Stack.Screen
        name="Medewerker"
        component={MedewerkerScreen}
        options={{
          headerShown: true, // Show the header with a back arrow
          headerTitle: "Medewerker", // Optional: Set a title for the screen
        }}
      />
      <Stack.Screen
        name="Administrator"
        component={AdministratorScreen}
        options={{
          headerShown: true, // Show the header with a back arrow
          headerTitle: "Administrator", // Optional: Set a title for the screen
        }}
      />
      <Stack.Screen
        name="Koppelen"
        component={KoppelenScreen}
        options={{
          headerShown: true, // Show the header with a back arrow
          headerTitle: "Koppelen", // Optional: Set a title for the screen
        }}
      />
      <Stack.Screen
        name="CombinatieConfig"
        component={CombinatieConfig}
        options={{
          headerShown: true, // Show the header with a back arrow
          headerTitle: "Combinatie Config", // Optional: Set a title for the screen
        }}
      />
      <Stack.Screen
        name="KoppelingTutorial"
        component={KoppelingTutorial}
        options={{
          headerShown: true, // Show the header with a back arrow
          headerTitle: "Koppeling Tutorial", // Optional: Set a title for the screen
        }}
      />
    </Stack.Navigator>
  );
}
