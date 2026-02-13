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

  // login: async (data) => {
  //   try {
  //     console.log(data);
  //     const res = await axiosInstance.post("/auth/login", data);
  //     set({ authUser: res.data });
  //     toast.success("Logged In!");
  //     get().connectSocket();
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Invalid Credentials!");
  //   }
  // },
  // Inside your useAuthStore.js
login: async (data) => {
  set({ isLoggingIn: true });
  try {
    const res = await axiosInstance.post("/auth/login", data);
    
    // SAVE TO LOCAL STORAGE IMMEDIATELY
    localStorage.setItem("userId", res.data._id);
    localStorage.setItem("userEmail", res.data.mail); // Use 'mail' from your backend res

    set({ authUser: res.data });
    toast.success("Logged in successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    set({ isLoggingIn: false });
  }
},
  logout: async () => {
  try {
    // 1. Call backend to clear the cookie
    await axiosInstance.post("/auth/logout");
    
    // 2. Clear local storage
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    
    // 3. Reset Zustand state
    set({ authUser: null });
    
    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Failed to logout");
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