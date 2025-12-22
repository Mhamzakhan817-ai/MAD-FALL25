// screens/ProductDetailsScreen.js
import {
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";

import { fetchProductById } from "../redux/slices/productSlice";
import { addItem } from "../redux/slices/cartSlice";

import WishlistIcon from "../components/WishlistIcon";
import ToastMessage from "../components/ToastMessage";
import Modal from "react-native-modal";
import SizeChartModal from "../components/SizeChart";

import { formatPrice } from "../utils/formatPrice";

export default function ProductDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const dispatch = useDispatch();
  const { single: product, loading } = useSelector((state) => state.products);
  const userId = useSelector((state) => state.auth.user?.id);

  const [toastVisible, setToastVisible] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const [unit, setUnit] = useState("yard"); // 🔥 NEW
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
    else navigation.navigate("Tabs");
  }, [id]);

  if (loading || !product) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#D4A017" />
      </View>
    );
  }

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please login to continue.");
      return;
    }

    await dispatch(
      addItem({
        userId,
        productId: product._id,
        quantity,
        unit, // optional (backend-safe)
      })
    );

    setToastVisible(true);
    setShowQtyModal(false);
  };

  const quantities = unit === "yard"
    ? [1, 2, 3, 4, 5, 6]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

  return (
    <>
      <ScrollView style={styles.container}>
        <Image source={{ uri: product.image_url }} style={styles.image} />

        <View style={styles.headerRow}>
          <Text style={styles.name}>{product.name}</Text>
          <WishlistIcon productId={product._id} />
        </View>

        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.desc}>{product.description}</Text>

        <TouchableOpacity
          style={styles.sizeBtn}
          onPress={() => setShowSizeChart(true)}
        >
          <Text style={styles.sizeBtnText}>View Size Chart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => setShowQtyModal(true)}
        >
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </ScrollView>

      <ToastMessage
        message="Added to cart!"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      {/* 🔥 QUANTITY MODAL WITH UNIT TOGGLE */}
      <Modal
        isVisible={showQtyModal}
        onBackdropPress={() => setShowQtyModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Select Quantity</Text>

          {/* UNIT TOGGLE */}
          <View style={styles.unitToggle}>
            {["yard", "feet"].map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.unitBtn,
                  unit === u && styles.unitBtnActive,
                ]}
                onPress={() => {
                  setUnit(u);
                  setQuantity(1);
                }}
              >
                <Text
                  style={[
                    styles.unitText,
                    unit === u && styles.unitTextActive,
                  ]}
                >
                  {u.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* QUANTITY OPTIONS */}
          <View style={styles.qtyRow}>
            {quantities.map((q) => (
              <TouchableOpacity
                key={q}
                style={[
                  styles.qtyButton,
                  quantity === q && styles.qtyButtonActive,
                ]}
                onPress={() => setQuantity(q)}
              >
                <Text
                  style={[
                    styles.qtyText,
                    quantity === q && styles.qtyTextActive,
                  ]}
                >
                  {q} {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.modalAdd} onPress={handleAddToCart}>
            <Text style={styles.modalAddText}>
              Add {quantity} {unit} to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={showSizeChart}
        onBackdropPress={() => setShowSizeChart(false)}
      >
        <SizeChartModal onClose={() => setShowSizeChart(false)} />
      </Modal>
    </>
  );
}

const GOLD = "#D4A017";
const BLACK = "#000";

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center" },

  image: { width: "100%", height: 320, borderRadius: 14, marginBottom: 20 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: { fontSize: 28, fontWeight: "700", color: BLACK },
  price: { fontSize: 24, fontWeight: "700", color: GOLD, marginVertical: 12 },
  desc: { fontSize: 16, color: "#444", marginBottom: 20 },

  sizeBtn: {
    backgroundColor: BLACK,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  sizeBtnText: { color: GOLD, fontSize: 16, fontWeight: "700", textAlign: "center" },

  cartBtn: {
    backgroundColor: GOLD,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  modal: { justifyContent: "flex-end", margin: 0 },
  modalBox: {
    backgroundColor: "#fff",
    padding: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 14 },

  unitToggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
    gap: 10,
  },

  unitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  unitBtnActive: { backgroundColor: GOLD },

  unitText: { fontSize: 14, color: "#444", fontWeight: "600" },
  unitTextActive: { color: BLACK, fontWeight: "700" },

  qtyRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  qtyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  qtyButtonActive: { backgroundColor: GOLD },

  qtyText: { color: "#444", fontSize: 15 },
  qtyTextActive: { color: BLACK, fontWeight: "700" },

  modalAdd: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  modalAddText: { color: BLACK, fontSize: 18, fontWeight: "700" },
});