// screens/CartScreen.js
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
import { fetchCart, deleteItem, updateQuantity } from "../redux/slices/cartSlice";
import { useNavigation } from "@react-navigation/native";
import { formatPrice } from "../utils/formatPrice";

export default function CartScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.cart);
  const items = cart?.items || [];

  useEffect(() => {
    if (user) dispatch(fetchCart(user.id));
  }, [user]);

  // ✅ TOTAL = sum of all subtotals
  const total = items.reduce((sum, item) => {
    const price = Number(item?.product?.price) || 0;
    const qty = Number(item?.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const increaseQty = (item) => {
    dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity + 1 }));
  };

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity - 1 }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Cart</Text>

      {items.length === 0 && (
        <Text style={styles.empty}>Your cart is empty.</Text>
      )}

      {items.map((item) => {
        const price = item.product.price;
        const subtotal = price * item.quantity;

        return (
          <View key={item._id} style={styles.itemBox}>
            {/* PRODUCT IMAGE */}
            <Image
              source={{ uri: item.product.image_url }}
              style={styles.image}
            />

            {/* DETAILS */}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.product.name}</Text>

              {/* PRICE PER UNIT */}
              <Text style={styles.price}>
                {formatPrice(price)} / unit
              </Text>

              {/* QUANTITY CONTROLS */}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => decreaseQty(item)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => increaseQty(item)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* SUBTOTAL */}
              <Text style={styles.subTotal}>
                Subtotal:{" "}
                <Text style={{ color: "#D4AF37" }}>
                  {formatPrice(subtotal)}
                </Text>
              </Text>

              {/* REMOVE */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => dispatch(deleteItem(item._id))}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {items.length > 0 && (
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{formatPrice(total)}</Text>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate("Checkout")}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ================== THEME ================== */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#000",
    flex: 1,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#D4AF37",
    alignSelf: "center",
    marginBottom: 20,
  },

  empty: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 30,
  },

  itemBox: {
    flexDirection: "row",
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },

  image: {
    width: 75,
    height: 75,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#444",
  },

  itemName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  price: {
    fontSize: 15,
    color: "#ccc",
    marginTop: 4,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  qtyBtn: {
    backgroundColor: "#222",
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },

  qtyBtnText: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "800",
  },

  qtyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 12,
  },

  subTotal: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },

  removeBtn: {
    backgroundColor: "#B22222",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: 90,
    alignItems: "center",
  },

  removeText: {
    color: "#fff",
    fontWeight: "700",
  },

  totalBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },

  totalLabel: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },

  totalAmount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#D4AF37",
    marginTop: 8,
  },

  checkoutButton: {
    marginTop: 20,
    backgroundColor: "#D4AF37",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  checkoutText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "800",
  },
});