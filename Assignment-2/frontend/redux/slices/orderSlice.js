import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createOrder, getUserOrders } from "../../services/orderService";

// 🟣 PLACE ORDER (backend builds items from cart)
export const placeOrder = createAsyncThunk(
  "orders/place",
  async ({ userId, total, paymentMethod }, { rejectWithValue }) => {
    try {
      return await createOrder({ userId, total, paymentMethod });
    } catch (error) {
      return rejectWithValue("Failed to place order");
    }
  }
);

// 🔵 LOAD USER ORDERS
export const fetchOrders = createAsyncThunk(
  "orders/fetch",
  async (userId, { rejectWithValue }) => {
    try {
      return await getUserOrders(userId);
    } catch (error) {
      return rejectWithValue("Failed to load orders");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // FETCH USER ORDERS
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // PLACE ORDER
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
