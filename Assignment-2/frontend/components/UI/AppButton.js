import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary", // primary | secondary | danger | outline
}) {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondary;
      case "danger":
        return styles.danger;
      case "outline":
        return styles.outline;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    if (variant === "outline") return styles.textOutline;
    return styles.text;
  };

  const getSpinnerColor = () => {
    if (variant === "outline") return "#000";
    return "#bfa54e"; // gold spinner on dark buttons
  };

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        getButtonStyle(),
        isDisabled &&
          (variant === "outline" ? styles.disabledOutline : styles.disabled),
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 6,
  },

  primary: {
    backgroundColor: "#000000",
  },
  secondary: {
    backgroundColor: "#bfa54e",
  },
  danger: {
    backgroundColor: "#b71c1c",
  },
  outline: {
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "transparent",
  },

  text: {
    color: "#bfa54e",
    fontSize: 16,
    fontWeight: "700",
  },

  textOutline: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },

  disabled: {
    backgroundColor: "#555",
  },

  disabledOutline: {
    borderColor: "#777",
  },
});
