import React from "react";
import { View, Button } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import MedewerkerScreen from "./MedewerkerScreen";
import AdministratorScreen from "./AdministratorScreen";
import KoppelenScreen from "./KoppelenScreen";
import CombinatieConfig from "./CombinatieConfig";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        title="Medewerker"
        onPress={() => navigation.navigate("Medewerker")}
      />
      <View style={{ marginVertical: 10 }} />
      <Button
        title="Administrator"
        onPress={() => navigation.navigate("Administrator")}
      />
    </View>
  );
}

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
    </Stack.Navigator>
  );
}