import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, signupUser } from "../../services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔵 LOGIN
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginUser(email, password);

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Login failed"
      );
    }
  }
);

// 🟣 SIGNUP (no auto-login)
export const signup = createAsyncThunk(
  "auth/signup",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      await signupUser(name, email, password);
      return true;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Signup failed"
      );
    }
  }
);

// 🔐 LOAD USER
export const loadUser = createAsyncThunk("auth/loadUser", async () => {
  const user = await AsyncStorage.getItem("user");
  const token = await AsyncStorage.getItem("token");

  return {
    user: user ? JSON.parse(user) : null,
    token,
  };
});

// 🚪 LOGOUT (side effects belong here)
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("token");
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // SIGNUP
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOAD USER
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export default authSlice.reducer;
