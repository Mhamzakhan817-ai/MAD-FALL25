// screens/OrdersScreen.js
import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../redux/slices/orderSlice";

export default function OrdersScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.id));
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You have no orders yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>My Orders</Text>

      {orders.map((order) => (
        <View key={order._id} style={styles.orderBox}>
          
          {/* Order Details */}
          <View style={styles.row}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>{order._id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, styles.status]}>
              {order.status}
            </Text>
          </View>

          {/* Products */}
          <View style={styles.itemsBox}>
            {order.items.map((item) => (
              <View key={item._id} style={styles.productRow}>
                <Image
                  source={{ uri: item.product.image_url }}
                  style={styles.productImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment:</Text>
            <Text style={styles.value}>{order.paymentMethod}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>Rs {order.total}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000";

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    color: BLACK,
    textAlign: "center",
  },

  orderBox: {
    backgroundColor: "#f9f7f3",           // soft luxury beige
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1.2,
    borderColor: GOLD,                    // gold border
    shadowColor: BLACK,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: BLACK,
  },

  value: {
    fontSize: 16,
    color: "#444",
  },

  status: {
    color: GOLD,
    fontWeight: "700",
  },

  // PRODUCTS SECTION
  itemsBox: {
    marginVertical: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },

  productRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },

  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: GOLD,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: BLACK,
  },

  itemQty: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  totalLabel: { fontSize: 18, fontWeight: "700", color: BLACK },

  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: GOLD,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#777" },
  emptyText: { fontSize: 18, color: "#777" },
});