import api from "./apiClient";

// 🧾 CREATE ORDER (items are derived from cart on backend)
export const createOrder = async ({ userId, total, paymentMethod }) => {
  const res = await api.post("/orders/create", {
    userId,
    total,
    paymentMethod,
  });
  return res.data;
};

// 📦 GET USER ORDERS
export const getUserOrders = async (userId) => {
  const res = await api.get(`/orders/${userId}`);
  return res.data;
};
