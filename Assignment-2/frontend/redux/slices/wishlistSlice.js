import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toggleWishlist } from "../../services/userService";
import { getWishlistProducts } from "../../services/productService";

// ❤️ TOGGLE WISHLIST
export const handleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      return await toggleWishlist(userId, productId);
    } catch (error) {
      return rejectWithValue("Failed to update wishlist");
    }
  }
);

// 📦 FETCH WISHLIST PRODUCTS (single API call)
export const fetchWishlistProducts = createAsyncThunk(
  "wishlist/products",
  async (wishlistIds, { rejectWithValue }) => {
    try {
      if (!wishlistIds || wishlistIds.length === 0) {
        return [];
      }
      return await getWishlistProducts(wishlistIds);
    } catch (error) {
      return rejectWithValue("Failed to load wishlist products");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],       // product IDs
    products: [],    // product objects
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // TOGGLE
      .addCase(handleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleWishlist.fulfilled, (state, action) => {
        state.items = action.payload.wishlist;
        state.products = []; // reset to avoid stale data
        state.loading = false;
      })
      .addCase(handleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH PRODUCTS
      .addCase(fetchWishlistProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlistProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchWishlistProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default wishlistSlice.reducer;
