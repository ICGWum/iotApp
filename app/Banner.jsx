// Banner.js
import React from "react";
import { View, Image, StyleSheet } from "react-native";

const Banner = () => {
  return (
    <View style={styles.banner}>
      <Image
        source={require("../assets/images/mechielsen.png")} // Update the path to your image
        style={styles.bannerImage}
        resizeMode="contain" // Use 'contain' to maintain aspect ratio
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: "100%", // Full width
    height: 200, // Adjust height as needed
    alignItems: "center", // Center the image horizontally
    justifyContent: "center", // Center the image vertically
    padding: 10, // Add padding around the image
    marginTop: 40, // Space above the banner
  },
  bannerImage: {
    width: "80%", // Adjust width to shrink the image
    height: "80%", // Adjust height to shrink the image
  },
});

export default Banner;
