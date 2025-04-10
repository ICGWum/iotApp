import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const PhotoGalleryScreen = () => {
  const navigation = useNavigation();

  // Template photos - replace with your actual image sources
  const photos = [
    { id: 1, source: require("../assets/images/photo1.png"), title: "Foto 1" },
    { id: 2, source: require("../assets/images/photo2.png"), title: "Foto 2" },
    { id: 3, source: require("../assets/images/photo3.png"), title: "Foto 3" },
    { id: 4, source: require("../assets/images/photo4.png"), title: "Foto 4" },
    // Add more as needed
  ];

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
        <TouchableOpacity style={styles.sidebarItem}>
          <Text style={[styles.sidebarText, styles.boldText]}>Foto's</Text>
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
        {/* Screen Title */}
        <Text style={styles.title}>Koppelen Tutorial</Text>

        {/* Photo Gallery */}
        <ScrollView style={styles.scrollContainer}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoContainer}>
              {/* Photo */}
              <Image source={photo.source} style={styles.photo} />
              {/* Photo Label */}
              <Text style={styles.photoLabel}>{photo.title}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff", // Background color for the entire screen
  },
  sidebar: {
    width: 100, // Sidebar width
    backgroundColor: "#f0f0f0", // Sidebar background color
    paddingVertical: 20, // Vertical padding for the sidebar
    alignItems: "center", // Center align items in the sidebar
  },
  sidebarItem: {
    paddingVertical: 15, // Vertical padding for each sidebar item
    width: "100%", // Full width for sidebar items
    alignItems: "center", // Center align text in sidebar items
  },
  sidebarText: {
    fontSize: 16, // Font size for sidebar text
    color: "#333", // Text color for sidebar items
  },
  locationContainer: {
    paddingVertical: 20, // Vertical padding for the location container
    borderBottomWidth: 1, // Bottom border for separation
    borderBottomColor: "#ccc", // Border color
    width: "100%", // Full width for the location container
    alignItems: "center", // Center align text
  },
  locationText: {
    fontSize: 14, // Font size for location text
    fontWeight: "bold", // Bold text for location
    color: "#555", // Text color for location
    marginVertical: 5, // Vertical margin for spacing
  },
  content: {
    flex: 1, // Take up remaining space
    padding: 20, // Padding for the main content
  },
  title: {
    fontSize: 20, // Font size for the title
    fontWeight: "bold", // Bold text for the title
    marginBottom: 20, // Margin below the title
    textAlign: "center", // Center align the title
  },
  scrollContainer: {
    flex: 1, // Allow scrolling for the photo gallery
  },
  photoContainer: {
    marginBottom: 30, // Margin below each photo
    alignItems: "center", // Center align photos
  },
  photo: {
    width: "100%", // Full width for photos
    height: 250, // Fixed height for photos
    resizeMode: "cover", // Cover the available space
    borderRadius: 10, // Rounded corners for photos
    marginBottom: 10, // Margin below each photo
  },
  boldText: {
    fontWeight: "bold", // Bold text style for selected sidebar item
  },
  photoLabel: {
    fontSize: 16, // Font size for photo labels
    fontWeight: "bold", // Bold text for photo labels
    alignSelf: "flex-start", // Align labels to the start
  },
});

export default PhotoGalleryScreen;
