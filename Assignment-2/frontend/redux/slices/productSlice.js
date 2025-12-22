import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
} from "../../services/productService";

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllProducts();
    } catch (error) {
      return rejectWithValue("Failed to load products");
    }
  }
);

export const fetchFeatured = createAsyncThunk(
  "products/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      return await getFeaturedProducts();
    } catch (error) {
      return rejectWithValue("Failed to load featured products");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await getProductById(id);
    } catch (error) {
      return rejectWithValue("Failed to load product");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    featured: [],
    single: null,
    loadingList: false,
    loadingSingle: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Load all products
      .addCase(fetchProducts.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loadingList = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload;
      })

      // Load featured
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.featured = action.payload;
      })
      .addCase(fetchFeatured.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Load single product
      .addCase(fetchProductById.pending, (state) => {
        state.loadingSingle = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.single = action.payload;
        state.loadingSingle = false;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingSingle = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
