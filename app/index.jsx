import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { SafeAreaView } from "react-native";
import FlashMessage from "react-native-flash-message";

import MedewerkerScreen from "./MedewerkerScreen";
import AdministratorScreen from "./AdministratorScreen";
import KoppelenScreen from "./KoppelenScreen";
import CombinatieConfig from "./CombinatieConfig";
import Banner from "./Banner";
import KoppelingTutorial from "./KoppelingTutorial";


const firebaseConfig = {
  apiKey: "AIzaSyBcXSf-sWWV5apE4p4nTX8Kk-1P6GHkDH8",
  authDomain: "iotapp-18a62.firebaseapp.com",
  projectId: "iotapp-18a62",
  storageBucket: "iotapp-18a62.firebasestorage.app",
  messagingSenderId: "233179299412",
  appId: "1:233179299412:web:cb9522f9459689bddb37c1",
  measurementId: "G-3627MBT7G9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { auth };

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userEmail = userCredential.user.email;

      // Route based on email
      if (userEmail === "administrator@test.nl") {
        navigation.replace("Administrator");
      } else {
        navigation.replace("Medewerker");
      }
    } catch (error) {
      console.log("Error:", error); // Log the error for debugging

      // Show the flash message
      showMessage({
        message: error.message || "Login failed",
        type: "danger", // You can change the message type to success, warning, or info as well
        duration: 3000, // How long the message stays on screen (in milliseconds)
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Banner />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.buttonContainer}
          >
            <Text style={styles.signInText}>Inloggen</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Wachtwoord"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.buttonWrapper}>
              <Button title="Login" onPress={handleLogin} />
            </View>
          </KeyboardAvoidingView>

          <View style={styles.bannerBottom}>
            <Text style={styles.footerText}>© 2025 Team B2</Text>
          </View>
        </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Medewerker"
        component={MedewerkerScreen}
        options={{ headerShown: true, headerTitle: "Medewerker" }}
      />
      <Stack.Screen
        name="Administrator"
        component={AdministratorScreen}
        options={{ headerShown: true, headerTitle: "Administrator" }}
      />
      <Stack.Screen
        name="Koppelen"
        component={KoppelenScreen}
        options={{ headerShown: true, headerTitle: "Koppelen" }}
      />
      <Stack.Screen
        name="CombinatieConfig"
        component={CombinatieConfig}
        options={{ headerShown: true, headerTitle: "Combinatie Config" }}
      />
      <Stack.Screen
        name="KoppelingTutorial"
        component={KoppelingTutorial}
        options={{ headerShown: true, headerTitle: "Koppeling Tutorial" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  signInText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: "80%",
  },
  buttonWrapper: {
    width: "80%",
    borderRadius: 5,
  },
  bannerBottom: {
    height: 80,
    backgroundColor: "#149cfb",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});