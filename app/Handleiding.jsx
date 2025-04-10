import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const PhotoGalleryScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Location Header */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Mechielsen</Text>
        </View>

        {/* Navigation Buttons */}
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate("KoppelenScreen")}
        >
          <Text style={styles.sidebarText}>Terug</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate("KoppelingTutorial")}
        >
          <Text style={styles.sidebarText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate("PhotoScreen")}
        >
          <Text style={styles.sidebarText}>Foto's</Text>
        </TouchableOpacity>

        {/* Current Screen Highlight */}
        <TouchableOpacity style={styles.sidebarItem}>
          <Text style={[styles.sidebarText, styles.boldText]}>Handleiding</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Screen Title */}
        <Text style={styles.title}>Handleiding</Text>

        {/* Placeholder for Buttons */}
        <View style={styles.buttonContainer}></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row", // Layout with sidebar and main content
    backgroundColor: "#fff",
  },
  sidebar: {
    width: 100, // Fixed width for the sidebar
    backgroundColor: "#f0f0f0",
    paddingVertical: 20,
    alignItems: "center", // Center items horizontally
  },
  sidebarItem: {
    paddingVertical: 15, // Spacing between items
    width: "100%",
    alignItems: "center",
  },
  boldText: {
    fontWeight: "bold", // Bold text for the current screen
  },
  sidebarText: {
    fontSize: 16,
    color: "#333", // Text color for sidebar items
  },
  locationContainer: {
    paddingVertical: 20, // Padding for the location header
    borderBottomWidth: 1, // Separator line
    borderBottomColor: "#ccc",
    width: "100%",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555", // Text color for the location header
    marginVertical: 5,
  },
  content: {
    flex: 1, // Take up remaining space
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center", // Center the title
    marginTop: 50,
  },
  buttonContainer: {
    flexDirection: "column", // Stack buttons vertically
    alignItems: "center",
    width: "100%",
    marginTop: 180, // Space from the top
  },
  button: {
    backgroundColor: "#007BFF", // Button background color
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5, // Rounded corners
    marginBottom: 15, // Space between buttons
    width: "80%", // Set width to 80% of the parent container
  },
  buttonText: {
    color: "#fff", // Button text color
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  displayContainer: {
    flexDirection: "column", // Stack display items vertically
    alignItems: "center",
    marginTop: 50,
  },
  displayItem: {
    fontSize: 16,
    padding: 15,
    borderWidth: 1, // Border around display items
    borderColor: "#000",
    marginBottom: 10, // Space between items
    width: "80%", // Set width to 80% of the parent container
    textAlign: "center",
    borderRadius: 15, // Rounded corners
  },
  greenBackground: {
    backgroundColor: "green", // Green background for specific items
    color: "#fff", // Change text color for better readability
  },
  redBackground: {
    backgroundColor: "red", // Red background for specific items
    color: "#fff", // Change text color for better readability
  },
});

export default PhotoGalleryScreen;
