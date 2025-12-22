// screens/CategoriesScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductGrid from "../components/ProductGrid";

export default function CategoriesScreen({ showInsideHome = false }) {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (!products || products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>No products available.</Text>
      </View>
    );
  }

  // Extract clean categories
  const categories = [...new Set(products.map((p) => p.category))];

  // Filter products for selected category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : [];

  return (
    <View style={[styles.container, showInsideHome && { paddingHorizontal: 0 }]}>
      {!showInsideHome && <Text style={styles.heading}>Categories</Text>}

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive,
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

      {/* Products Matching Category */}
      {selectedCategory ? (
        <>
          {!showInsideHome && (
            <Text style={styles.subHeading}>{selectedCategory}</Text>
          )}
          <ProductGrid products={filteredProducts} />
        </>
      ) : (
        !showInsideHome && (
          <Text style={styles.selectText}>Select a category to view products</Text>
        )
      )}
    </View>
  );
}

const GOLD = "#D4AF37";
const BLACK = "#000000";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    color: BLACK,
  },
  categoryScroll: { marginBottom: 18 },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f3f3f3",
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: BLACK,
  },
  categoryButtonActive: {
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
  subHeading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: BLACK,
  },
  selectText: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  loadingText: { fontSize: 18, color: BLACK },
  center: { justifyContent: "center", alignItems: "center", padding: 16 },
});