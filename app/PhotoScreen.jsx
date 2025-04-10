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
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Mechielsen</Text>
        </View>

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
        <Text style={styles.title}>Koppelen Tutorial</Text>

        <ScrollView style={styles.scrollContainer}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoContainer}>
              <Image source={photo.source} style={styles.photo} />
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
  },
  scrollContainer: {
    flex: 1,
  },
  photoContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  photo: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
    boldText: {
    fontWeight: "bold", // Add bold text style
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
});

export default PhotoGalleryScreen;
