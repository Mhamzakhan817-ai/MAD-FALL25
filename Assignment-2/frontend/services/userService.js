import api from "./apiClient";

// LOGIN
export const loginUser = async (email, password) => {
  const res = await api.post("/users/login", { email, password });
  return res.data;
};

// SIGNUP
export const signupUser = async (name, email, password) => {
  const res = await api.post("/users/signup", { name, email, password });
  return res.data;
};

// WISHLIST TOGGLE
export const toggleWishlist = async (userId, productId) => {
  const res = await api.post("/users/wishlist", { userId, productId });
  return res.data;
};
