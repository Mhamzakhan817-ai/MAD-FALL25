import api from "./apiClient";

// 📦 GET CART
export const getCart = async (userId) => {
  const res = await api.get(`/cart/${userId}`);
  return res.data.cart;
};

// ➕ ADD TO CART
export const addToCart = async (
  userId,
  productId,
  quantity,
  unit = "yard"
) => {
  const res = await api.post(`/cart/${userId}/add`, {
    productId,
    quantity,
    unit,
  });
  return res.data.cart;
};

// ❌ REMOVE ITEM
export const removeCartItem = async (userId, itemId) => {
  const res = await api.delete(`/cart/${userId}/remove/${itemId}`);
  return res.data.cart;
};

// 🔄 UPDATE QUANTITY / UNIT
export const updateCartItem = async (
  userId,
  itemId,
  quantity,
  unit
) => {
  const body = { quantity };
  if (unit) body.unit = unit;

  const res = await api.patch(
    `/cart/${userId}/update/${itemId}`,
    body
  );
  return res.data.cart;
};
