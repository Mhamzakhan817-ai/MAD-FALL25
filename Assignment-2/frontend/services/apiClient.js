import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../constants";

const apiClient = axios.create({
  baseURL: API.BASE_URL,
});

// 🔐 Token cache (prevents async interceptor issues)
let authToken = null;

// Load token once
export const loadAuthToken = async () => {
  authToken = await AsyncStorage.getItem("token");
};

// Clear token on logout
export const clearAuthToken = () => {
  authToken = null;
};

// Attach token synchronously
apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Optional: normalize API errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
