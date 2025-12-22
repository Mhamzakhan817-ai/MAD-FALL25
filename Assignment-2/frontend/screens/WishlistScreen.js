// screens/WishlistScreen.js
import React, { useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { handleWishlist, fetchWishlistProducts } from "../redux/slices/wishlistSlice";
import { addItem } from "../redux/slices/cartSlice";

export default function WishlistScreen() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const wishlistIds = useSelector((state) => state.wishlist.items);
  const products = useSelector((state) => state.wishlist.products);

  useEffect(() => {
    if (wishlistIds.length > 0) {
      dispatch(fetchWishlistProducts(wishlistIds));
    }
  }, [wishlistIds]);

  if (!products || products.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          Your Favorite Products will appear here ❤️
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Wishlist</Text>

      {products.map((item) => (
        <View key={item._id} style={styles.card}>

          {/* Product Image */}
          <Image source={{ uri: item.image_url }} style={styles.image} />

          <View style={styles.infoWrap}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>Rs. {item.price}</Text>

            <View style={styles.btnRow}>
              {/* Add to Cart */}
              <TouchableOpacity
                style={styles.cartBtn}
                onPress={() =>
                  dispatch(
                    addItem({
                      userId: user.id,
                      productId: item._id,
                      quantity: 1,
                    })
                  )
                }
              >
                <Text style={styles.cartBtnText}>+ Cart</Text>
              </TouchableOpacity>

              {/* Remove */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() =>
                  dispatch(handleWishlist({ userId: user.id, productId: item._id }))
                }
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      ))}
    </ScrollView>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000";
const DARK_CARD = "#0c0c0c";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: BLACK,
    flex: 1,
  },

  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: GOLD,
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 1,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BLACK,
    padding: 20,
  },

  emptyText: {
    color: GOLD,
    fontSize: 20,
    opacity: 0.8,
    textAlign: "center",
  },

  card: {
    flexDirection: "row",
    backgroundColor: DARK_CARD,
    borderRadius: 14,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  image: {
    width: 95,
    height: 95,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: GOLD,
  },

  infoWrap: { flex: 1, justifyContent: "space-between" },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: GOLD,
    marginBottom: 4,
  },

  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ddd",
    marginBottom: 10,
  },

  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cartBtn: {
    backgroundColor: GOLD,
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  cartBtnText: {
    color: BLACK,
    fontWeight: "800",
    fontSize: 14,
    textTransform: "uppercase",
  },

  removeBtn: {
    backgroundColor: "#8B0000",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  removeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});