// screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import FeaturedCarousel from "../components/FeaturedCarousel";
import ProductGrid from "../components/ProductGrid";

import { fetchProducts, fetchFeatured } from "../redux/slices/productSlice";

export default function HomeScreen() {
  const dispatch = useDispatch();

  const { items: products, featured, loading } = useSelector(
    (state) => state.products
  );

  // category state
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchFeatured());
  }, []);

  if (loading) {
    return (
      <Text style={{ marginTop: 40, textAlign: "center", fontSize: 18 }}>
        Loading products...
      </Text>
    );
  }

  // Extract unique categories
  const categories = [...new Set(products.map((p) => p.category))];

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <ScrollView style={styles.container}>
      {/* Centered Title */}
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Text style={styles.heading}>Top Fabrics Retail</Text>
      </View>

      {/* Featured Slider */}
      <FeaturedCarousel featured={featured} />

      {/* Category Chips */}
      <Text style={styles.sectionTitle}>Categories</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {/* All Products button */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === null && styles.categoryActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === null && styles.categoryTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtered Products Grid */}
      <ProductGrid products={filteredProducts} />
    </ScrollView>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000000";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ffffff" },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: BLACK,
    textAlign: "center",
    letterSpacing: 1,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: BLACK,
  },

  categoryScroll: { marginVertical: 10 },

  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: BLACK,
  },

  categoryActive: {
    backgroundColor: BLACK,
    borderColor: GOLD,
  },

  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: BLACK,
  },

  categoryTextActive: {
    color: GOLD,
  },
});