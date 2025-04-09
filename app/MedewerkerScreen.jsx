import React from "react";
import { View, Button, Text } from "react-native";

export default function MedewerkerScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome, Medewerker!</Text>
      <View style={{ marginVertical: 20 }} />
      <Button
        title="Go to Koppelen"
        onPress={() => navigation.navigate("Koppelen")}
      />
    </View>
  );
}