import React from "react";
import { View, Button, Text } from "react-native";

export default function AdministratorScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome, Administrator!</Text>
      <View style={{ marginVertical: 20 }} />
      <Button
        title="Go to Combinatie Config"
        onPress={() => navigation.navigate("CombinatieConfig")}
      />
      <Button
        title="Logout"
        onPress={() => navigation.navigate("Home")}
      />
    </View>
  );
}