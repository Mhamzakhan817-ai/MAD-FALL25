// components/FeaturedCarousel.js
import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import WishlistIcon from "./WishlistIcon";
import { formatPrice } from "../utils/formatPrice";

export default function FeaturedCarousel({ featured }) {
  const navigation = useNavigation();

  if (!featured || featured.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Featured Fabrics</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={174} // 160 + 14
        decelerationRate="fast"
      >

        {featured.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("ProductDetails", { id: item._id })
            }
          >
            <Image source={{ uri: item.image_url }} style={styles.image} />

            <View style={styles.row}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>

              <WishlistIcon productId={item._id} size={22} />
            </View>

            <Text style={styles.price}>{formatPrice(item.price)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000";

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    color: GOLD,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    marginRight: 14,
    width: 160,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: GOLD + "55",
    shadowColor: GOLD,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD + "66",
  },
  row: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
    marginRight: 6,
    color: GOLD,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
    color: GOLD,
  },
});
