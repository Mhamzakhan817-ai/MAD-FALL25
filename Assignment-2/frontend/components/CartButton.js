import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CartButton({ onPress, disabled = false, loading = false }) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>
        {loading ? "Adding..." : "Add to Cart"}
      </Text>
    </TouchableOpacity>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000000";

const styles = StyleSheet.create({
  button: {
    backgroundColor: GOLD,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: BLACK,
  },
  disabled: {
    backgroundColor: "#BFA76B",
    borderColor: "#555",
  },
  text: {
    color: BLACK,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
