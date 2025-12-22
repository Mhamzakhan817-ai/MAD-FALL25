// redux/store.js
import { configureStore } from "@reduxjs/toolkit";

import productReducer from "./slices/productSlice";
import wishlistReducer from "./slices/wishlistSlice";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import orderReducer from "./slices/orderSlice";


const store = configureStore({
  reducer: {
    products: productReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    auth: authReducer,
    orders: orderReducer,
  },
});

export default store;
