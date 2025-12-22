// components/ProductCard.js
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import WishlistIcon from "./WishlistIcon";
import { formatPrice } from "../utils/formatPrice";

export default function ProductCard({ item }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetails", { id: item._id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} />

      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <WishlistIcon productId={item._id} />
      </View>

      <Text style={styles.price}>{formatPrice(item.price)}</Text>
    </TouchableOpacity>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000000";

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#111",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "#333",

    // shadow
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  image: {
    width: "100%",
    height: 170,
    backgroundColor: "#222",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
    alignItems: "center",
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    color: GOLD,
    flex: 1,
    marginRight: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: GOLD,
    paddingHorizontal: 10,
    marginTop: 6,
  },
});
