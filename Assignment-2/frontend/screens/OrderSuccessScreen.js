// screens/OrderSuccessScreen.js
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { useRef } from "react";

export default function OrderSuccessScreen() {
  const navigation = useNavigation();
  const animationRef = useRef(null);

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs" }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Success Animation */}
      <LottieView
        ref={animationRef}
        autoPlay
        loop={false}
        style={styles.animation}
        source={require("../assets/animations/success.json")}
      />

      <Text style={styles.title}>Order Placed Successfully!</Text>

      <Text style={styles.message}>
        Thank you for shopping at Top Fabrics Retail.
      </Text>

      <TouchableOpacity style={styles.button} onPress={goHome}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000000";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  animation: {
    width: 230,
    height: 230,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
    color: GOLD,
    textAlign: "center",
  },

  message: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  button: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    paddingHorizontal: 34,
    borderRadius: 14,
    shadowColor: GOLD,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },

  buttonText: {
    color: BLACK,
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});