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

        {/* Sidebar Navigation Items */}
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate("KoppelenScreen")}
        >
          <Text style={styles.sidebarText}>Terug</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <Text style={[styles.sidebarText, styles.boldText]}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate("PhotoScreen")}
        >
          <Text style={styles.sidebarText}>Foto's</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => navigation.navigate("Handleiding")}
        >
          <Text style={styles.sidebarText}>Handleiding</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Koppelingen scannen</Text>

        {/* Two buttons centered and same width */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Scan een slang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Scan een aansluiting</Text>
          </TouchableOpacity>
        </View>

        {/* Display items stacked vertically with background color changes */}
        <View style={styles.displayContainer}>
          <Text style={[styles.displayItem, styles.greenBackground]}>
            Koppeling 1
          </Text>
          <Text style={[styles.displayItem, styles.redBackground]}>
            Koppeling 2
          </Text>
          <Text style={[styles.displayItem, styles.redBackground]}>
            Koppeling 3
          </Text>
          <Text style={[styles.displayItem, styles.greenBackground]}>
            Koppeling 4
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  sidebar: {
    width: 100,
    backgroundColor: "#f0f0f0",
    paddingVertical: 20,
    alignItems: "center",
  },
  sidebarItem: {
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
  },
  sidebarText: {
    fontSize: 16,
    color: "#333",
  },
  boldText: {
    fontWeight: "bold", // Add bold text style
  },
  locationContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginVertical: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 50,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginTop: 180,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 15,
    width: "80%", // Set width to 80% of the parent container
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  displayContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 50,
  },
  displayItem: {
    fontSize: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
    width: "80%", // Set width to 80% of the parent container
    textAlign: "center",
    borderRadius: 15,
  },
  greenBackground: {
    backgroundColor: "green",
    color: "#fff", // Change text color for better readability
  },
  redBackground: {
    backgroundColor: "red",
    color: "#fff", // Change text color for better readability
  },
});

export default PhotoGalleryScreen;
