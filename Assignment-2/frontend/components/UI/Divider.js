// components/UI/Divider.js
import React from "react";
import { View, StyleSheet } from "react-native";

export default function Divider({
  color = "rgba(212, 175, 55, 0.35)", // soft gold theme
  thickness = 1,
  spacing = 14,
  inset = 0,
  vertical = false,
}) {
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        {
          backgroundColor: color,
          height: vertical ? "100%" : thickness,
          width: vertical ? thickness : "100%",
          marginVertical: vertical ? 0 : spacing,
          marginHorizontal: vertical ? spacing : 0,
          marginLeft: inset,
          borderRadius: 50,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
  },
  vertical: {
    height: "100%",
  },
});
