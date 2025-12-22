// screens/CheckoutScreen.js
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../redux/slices/orderSlice";
import { clearCart } from "../redux/slices/cartSlice";
import { useNavigation } from "@react-navigation/native";
import { formatPrice } from "../utils/formatPrice";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.cart);
  const items = cart?.items || [];


  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);

  // Safely compute total (avoid NaN)
  const total = items.reduce((sum, item) => {
    const price = Number(item?.product?.price) || 0;
    const qty = Number(item?.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const onPlaceOrder = async () => {
    if (!user) {
      return Alert.alert("Login Required", "Please login to place your order.");
    }
    if (!items || items.length === 0) {
      return Alert.alert("Empty Cart", "Your cart is empty.");
    }

    // Build order payload
 const orderData = {
        userId: user.id,
        items: items.map((item) => ({
            product: item.product,   // ✅ backend expects this
            quantity: item.quantity,
        })),
        total,
        paymentMethod,
    };


    try {
      setPlacing(true);
      const result = await dispatch(placeOrder(orderData));
      setPlacing(false);

      if (result.meta?.requestStatus === "fulfilled") {
        // success
        dispatch(clearCart());
        navigation.navigate("OrderSuccess", {
          orderId: result.payload?._id,
        });
      } else {
        // failed — attempt to surface server error
        const serverMsg =
          result?.payload?.message ||
          result?.error?.message ||
          (result?.payload ? JSON.stringify(result.payload) : null);

        console.error("Place order failed:", result);
        Alert.alert(
          "Order Failed",
          serverMsg || "Please try again later."
        );
      }
    } catch (err) {
      setPlacing(false);
      console.error("Place order exception:", err);
      Alert.alert("Order Error", err.message || "Something went wrong.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      {/* TOP TOTAL */}
      <View style={styles.topTotal}>
        <Text style={styles.topTotalLabel}>Total</Text>
        <Text style={styles.topTotalValue}>{formatPrice(total)}</Text>
      </View>

      {/* ORDER SUMMARY */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        {items.map((item) => {
          const product = item.product || {};
          // try to detect unit (developer: your product object may contain a unit field)
          const unit =
            product.unit ||
            product.unitLabel ||
            product.measureUnit ||
            "yd"; // fallback to yards
          const priceLabel = `${formatPrice(product.price ?? 0)} / ${unit}`;

          return (
            <View key={item._id} style={styles.itemRow}>
              <Image
                source={{ uri: product.image_url }}
                style={styles.image}
                resizeMode="cover"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {product.name || "Unnamed product"}
                </Text>

                <Text style={styles.itemUnitPrice}>{priceLabel}</Text>

                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>

                <Text style={styles.itemPrice}>
                  {formatPrice((Number(product.price) || 0) * (Number(item.quantity) || 0))}
                </Text>
              </View>
            </View>
          );
        })}

        {/* TOTAL */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
        </View>
      </View>

      {/* PAYMENT METHOD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === "COD" && styles.paymentActive,
          ]}
          onPress={() => setPaymentMethod("COD")}
        >
          <Text
            style={[
              styles.paymentText,
              paymentMethod === "COD" && styles.paymentTextActive,
            ]}
          >
            Cash on Delivery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === "Card" && styles.paymentActive,
          ]}
          onPress={() => setPaymentMethod("Card")}
        >
          <Text
            style={[
              styles.paymentText,
              paymentMethod === "Card" && styles.paymentTextActive,
            ]}
          >
            Card Payment
          </Text>
        </TouchableOpacity>
      </View>

      {/* PLACE ORDER BUTTON */}
      <TouchableOpacity
        style={[styles.orderBtn, placing && styles.orderBtnDisabled]}
        onPress={onPlaceOrder}
        disabled={placing}
      >
        {placing ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.orderBtnText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000";

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#000", flex: 1 },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
    color: GOLD,
    letterSpacing: 1,
  },

  topTotal: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  topTotalLabel: { color: "#ddd", fontSize: 16, fontWeight: "600" },
  topTotalValue: { color: GOLD, fontSize: 20, fontWeight: "800" },

  section: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },

  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: GOLD },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: GOLD,
  },

  itemName: { fontSize: 16, color: "#eee", fontWeight: "700", marginBottom: 6 },

  itemUnitPrice: { fontSize: 13, color: "#ccc", marginBottom: 4 },

  itemQty: { fontSize: 14, color: "#ddd", marginBottom: 4 },

  itemPrice: { fontSize: 15, color: GOLD, fontWeight: "800" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#222",
    marginTop: 8,
  },

  totalLabel: { fontSize: 18, fontWeight: "700", color: "#fff" },

  totalAmount: { fontSize: 20, fontWeight: "800", color: GOLD },

  paymentOption: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#222",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },

  paymentActive: {
    backgroundColor: BLACK,
    borderColor: GOLD,
  },

  paymentText: { fontSize: 16, color: "#ccc", fontWeight: "600" },

  paymentTextActive: { color: GOLD, fontWeight: "700" },

  orderBtn: {
    backgroundColor: GOLD,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },

  orderBtnDisabled: {
    opacity: 0.8,
  },

  orderBtnText: {
    color: BLACK,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 1,
  },
});