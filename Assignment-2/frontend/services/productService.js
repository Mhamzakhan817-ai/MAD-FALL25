import api from "./apiClient";

// GET ALL PRODUCTS
export const getAllProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

// GET FEATURED
export const getFeaturedProducts = async () => {
  const res = await api.get("/products/featured");
  return res.data;
};

// GET PRODUCT BY ID
export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

// ❤️ GET WISHLIST PRODUCTS (single request)
export const getWishlistProducts = async (ids = []) => {
  if (!ids.length) return [];
  const query = ids.join(",");
  const res = await api.get(`/products/wishlist?ids=${query}`);
  return res.data;
};
