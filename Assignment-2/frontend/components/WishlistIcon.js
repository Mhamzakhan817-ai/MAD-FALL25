// components/WishlistIcon.js
import React, { useRef, useState } from "react";
import { TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { handleWishlist } from "../redux/slices/wishlistSlice";

const GOLD = "#D4AF37";
const WHITE = "#ffffff";

export default function WishlistIcon({ productId, size = 26 }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const wishlistIds = useSelector((state) => state.wishlist.items) || [];

  const isWishlisted = wishlistIds.includes(productId);

  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleWishlist = async () => {
    if (!user) return alert("Please login to manage wishlist");
    if (isLoading) return;

    setIsLoading(true);
    animateHeart();

    await dispatch(handleWishlist({ userId: user.id, productId }));

    setIsLoading(false);
  };

  return (
    <TouchableOpacity onPress={toggleWishlist} disabled={isLoading}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isWishlisted ? "heart" : "heart-outline"}
          size={size}
          color={isWishlisted ? GOLD : WHITE}  // ✔ FIXED COLOR
          style={styles.iconShadow}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconShadow: {
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4,
    textShadowOffset: { width: 1, height: 1 },
  },
});