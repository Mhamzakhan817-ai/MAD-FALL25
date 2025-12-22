import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCart,
  addToCart,
  removeCartItem,
  updateCartItem,
} from "../../services/cartService";

// FETCH CART
export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (userId, { rejectWithValue }) => {
    try {
      return await getCart(userId);
    } catch (error) {
      return rejectWithValue("Failed to fetch cart");
    }
  }
);

// ADD
export const addItem = createAsyncThunk(
  "cart/add",
  async ({ userId, productId, quantity, unit = "yard" }, { rejectWithValue }) => {
    try {
      return await addToCart(userId, productId, quantity, unit);
    } catch (error) {
      return rejectWithValue("Failed to add item");
    }
  }
);

// DELETE
export const deleteItem = createAsyncThunk(
  "cart/delete",
  async ({ userId, itemId }, { rejectWithValue }) => {
    try {
      return await removeCartItem(userId, itemId);
    } catch (error) {
      return rejectWithValue("Failed to remove item");
    }
  }
);

// UPDATE QTY / UNIT
export const updateQuantity = createAsyncThunk(
  "cart/update",
  async (
    { userId, itemId, quantity, unit },
    { rejectWithValue }
  ) => {
    try {
      return await updateCartItem(userId, itemId, quantity, unit);
    } catch (error) {
      return rejectWithValue("Failed to update item");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearCart(state) {
      state.cart = { items: [] };
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH CART
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload || { items: [] };
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })

      // DELETE
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })

      // UPDATE
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
