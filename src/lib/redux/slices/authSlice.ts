import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserSession {
  id: string;
  email: string;
  profileId: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: UserSession | null;
}

const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vikan_token");
    const userJson = localStorage.getItem("vikan_user");
    return {
      token,
      user: userJson ? JSON.parse(userJson) : null,
    };
  }
  return {
    token: null,
    user: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserSession }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (typeof window !== "undefined") {
        localStorage.setItem("vikan_token", action.payload.token);
        localStorage.setItem("vikan_user", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("vikan_token");
        localStorage.removeItem("vikan_user");
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
