// screens/SignupScreen.js
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import AppInput from "../components/UI/AppInput";
import AppButton from "../components/UI/AppButton";
import { signup } from "../redux/slices/authSlice";

export default function SignupScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignup = async () => {
    // 🛑 Basic validation
    if (!name || !email || !password) {
      return Alert.alert("Missing Fields", "Please fill all fields.");
    }

    const result = await dispatch(
      signup({ name: name.trim(), email: email.trim(), password })
    );

    if (result.meta.requestStatus === "fulfilled") {
      Alert.alert(
        "Account Created 🎉",
        "Please login to continue.",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("Login"), // ✅ clean redirect
          },
        ]
      );
    } else {
      Alert.alert("Signup Failed", "Email may already be registered.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <AppInput
        label="Name"
        placeholder="Enter full name"
        value={name}
        onChangeText={setName}
        icon="person-outline"
      />

      <AppInput
        label="Email"
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        icon="mail-outline"
        autoCapitalize="none"
      />

      <AppInput
        label="Password"
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        icon="lock-closed-outline"
      />

      <AppButton
        title={loading ? "Creating Account..." : "Sign Up"}
        onPress={onSignup}
        variant="primary"
        disabled={loading} // ✅ prevents double tap
      />

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLink}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginTop: 60,
    backgroundColor: "#000",
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 30,
    color: "#FFD700",
    textAlign: "center",
    letterSpacing: 1,
  },

  loginLink: {
    marginTop: 20,
    color: "#FFD700",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
});