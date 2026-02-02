import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL =
  import.meta.env.MODE && import.meta.env.MODE === "development"
    ? "http://localhost:5004"
    : "/";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  isCheckingAuth: true,
  socket: null,
  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const res = await axiosInstance.get("/auth/check");
      console.log("Checking Auth..., ", res);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in check auth :", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    try {
      console.log("Signup Response: ", data);
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account Created Successfully!");
      get().connectSocket();
    } catch (error) {
      console.log("Toast Error!");
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    try {
      console.log(data);
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged In!");
      get().connectSocket();
    } catch (error) {
      console.log(error);
      toast.error("Invalid Credentials!");
    }
  },
  logout: async () => {
    try {
      console.log("logout called");
      // Call the backend logout endpoint
      await axiosInstance.post("/auth/logout");

      // Clear the local authUser state to log the user out
      set({ authUser: null });

      // Optionally redirect the user to the login page (if using React Router)
      window.location.href = "/login"; // Or use React Router's `navigate('/login')`
      get.disconnectSocket();
    } catch (error) {
      console.log("Logout Error with Axios Instance:", error);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile Updated Successfully!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));