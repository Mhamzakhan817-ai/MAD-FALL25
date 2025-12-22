// screens/AccountScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function AccountScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          navigation.replace("Login");
        },
      },
    ]);
  };

  // ---------------------------------------------------------
  // ⚠️ Not Logged In View
  // ---------------------------------------------------------
  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={90} color={GOLD} />

        <Text style={styles.infoText}>You are not logged in</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.primaryBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------------------------------------------------
  // Logged-in View
  // ---------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Ionicons name="person-circle-outline" size={80} color={GOLD} />

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Orders")}
        >
          <Ionicons name="receipt-outline" size={24} color={GOLD} />
          <Text style={styles.menuText}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Wishlist")}
        >
          <Ionicons name="heart-outline" size={24} color={GOLD} />
          <Text style={styles.menuText}>My Wishlist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={24} color={GOLD} />
          <Text style={styles.menuText}>My Cart</Text>
        </TouchableOpacity>

      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={BLACK} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const GOLD = "#d4af37";
const BLACK = "#000";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
    padding: 20,
  },

  /* --- Not Logged In --- */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BLACK,
  },

  infoText: {
    fontSize: 20,
    marginTop: 12,
    color: "#fff",
    fontWeight: "600",
  },

  primaryBtn: {
    backgroundColor: GOLD,
    padding: 14,
    borderRadius: 12,
    width: 160,
    alignItems: "center",
    marginTop: 16,
  },
  primaryBtnText: {
    color: BLACK,
    fontSize: 16,
    fontWeight: "700",
  },

  /* --- Profile Card --- */
  profileCard: {
    backgroundColor: "#111",
    paddingVertical: 30,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 30,
  },

  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginTop: 10,
  },
  email: {
    fontSize: 15,
    color: "#bbb",
    marginTop: 4,
  },

  /* --- Menu Section --- */
  menuSection: {
    marginBottom: 40,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#111",
    borderLeftWidth: 5,
    borderLeftColor: GOLD,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#222",
  },

  menuText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 12,
  },

  /* --- Logout Button --- */
  logoutBtn: {
    backgroundColor: GOLD,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  logoutText: {
    color: BLACK,
    fontSize: 18,
    fontWeight: "800",
  },
});