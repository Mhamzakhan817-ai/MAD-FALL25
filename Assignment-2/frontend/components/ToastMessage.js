import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ToastMessage({
  message,
  visible,
  type = "success",
  onHide = () => {},
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // clear any previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (visible) {
      fade.stopAnimation();
      fade.setValue(0);

      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        timerRef.current = setTimeout(() => {
          Animated.timing(fade, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }).start(() => onHide());
        }, 1400);
      });
    }

    // cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible]);

  const backgroundColor =
    type === "error"
      ? "#b91c1c"
      : type === "warning"
      ? "#eab308"
      : "#111";

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fade,
          bottom: insets.bottom + 42,
          backgroundColor,
          borderColor: "#d4af37",
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 14,
    borderWidth: 1.2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 7,
  },
  text: {
    color: "#d4af37",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
