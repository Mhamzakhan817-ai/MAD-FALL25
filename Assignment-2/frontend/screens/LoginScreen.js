import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import AppInput from "../components/UI/AppInput";
import AppButton from "../components/UI/AppButton";
import { login } from "../redux/slices/authSlice";

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    console.log("Login button pressed"); // Debug

    const result = await dispatch(login({ email, password }));

    if (result.meta.requestStatus === "fulfilled") {
    // Navigation handled automatically by AppNavigator
    return;
  }

  alert("Invalid email or password");
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <AppInput
        label="Email"
        icon="mail"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />

      <AppInput
        label="Password"
        icon="lock-closed"
        secureTextEntry
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
      />

      <AppButton
        title={loading ? "Logging in..." : "Login"}
        onPress={onLogin}
        variant="primary"
      />

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>
          Don't have an account?{" "}
          <Text style={styles.linkHighlight}>Sign Up and order your favorite fabric</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 24, 
    marginTop: 80, 
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 40,
    color: "#000",
    letterSpacing: 1,
  },

  link: {
    color: "#555",
    marginTop: 18,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },

  linkHighlight: {
    color: "#D4AF37", // Gold
    fontWeight: "700",
  },
});