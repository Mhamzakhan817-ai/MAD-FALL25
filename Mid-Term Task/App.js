import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const [menu, setMenu] = useState([]);
  const [randomItem, setRandomItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch full menu
  useEffect(() => {
    fetch("http://192.168.1.6:3000/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching menu:", err);
        setLoading(false);
      });
  }, []);

  // Fetch random item
  const getRandomItem = () => {
    fetch("http://192.168.1.6:3000/menu/random")
      .then((res) => res.json())
      .then((data) => setRandomItem(data))
      .catch((err) => console.error("Error fetching random item:", err));
  };

  const renderItem = ({ item, index }) => {
    const cardStyle = [
      styles.card,
      { backgroundColor: index % 2 === 0 ? "#f5ebe0" : "#e8d5c4" },
    ];

    return (
      <TouchableOpacity style={cardStyle}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={[styles.stock, { color: item.inStock ? "green" : "red" }]}>
          {item.inStock ? "In Stock" : "Out of Stock"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>☕ Coffee Shop Menu</Text>
      </View>

      {/* Random Button */}
      <TouchableOpacity onPress={getRandomItem} style={styles.randomBtn}>
        <Text style={styles.randomText}>🎲 Get Random Item</Text>
      </TouchableOpacity>

      {/* Random Item Card */}
      {randomItem && (
        <View style={styles.randomCard}>
          <Text style={styles.randomTitle}>⭐ Random Pick</Text>
          <Text style={styles.randomName}>{randomItem.name}</Text>
          <Text style={styles.randomCategory}>{randomItem.category}</Text>
          <Text style={styles.randomPrice}>${randomItem.price}</Text>
        </View>
      )}

      {/* Menu List */}
      {loading ? (
        <Text style={styles.empty}>Loading menu...</Text>
      ) : (
        <FlatList
          data={menu}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No menu items found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf6ec",
    padding: 20,
  },
  header: {
    backgroundColor: "#6f4e37",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3e2723",
  },
  category: {
    fontSize: 14,
    color: "#6d4c41",
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    color: "#4e342e",
    marginTop: 5,
  },
  stock: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 50,
    fontSize: 16,
  },
  randomBtn: {
    backgroundColor: "#8b5e3c",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  randomText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  randomCard: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#d2691e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  randomTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d2691e",
    marginBottom: 6,
    textAlign: "center",
  },
  randomName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4e342e",
    textAlign: "center",
  },
  randomCategory: {
    fontSize: 14,
    color: "#795548",
    textAlign: "center",
  },
  randomPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3e2723",
    textAlign: "center",
    marginTop: 5,
  },
});
