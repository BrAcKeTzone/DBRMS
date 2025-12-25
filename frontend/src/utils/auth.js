import { useAuthStore } from "../store/authStore";

export const saveAuthToken = (token) => {
  useAuthStore.setState({ token, isAuthenticated: !!token });
};

export const getAuthToken = () => {
  return useAuthStore.getState().token;
};

export const removeAuthToken = () => {
  try {
    useAuthStore.getState().logout();
  } catch (e) {
    // fallback
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  }
};

export const isAuthenticated = () => {
  return !!useAuthStore.getState().token;
};
