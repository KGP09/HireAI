import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
const BASE_URL =
  import.meta.env.MODE && import.meta.env.MODE === "development"
    ? "http://localhost:5004"
    : "/";
export const useAIStore = create((set) => ({
  rounds: [],
  tests: [],
  isLoadingRounds: false,
  createTest: async (data) => {
    set({ isLoadingRounds: true });
    try {
      console.log("Creating Test with Data: ", data);
      const res = await axiosInstance.post("/ai/create-rounds", data);
      console.log("Create Test Response: ", res.data);
      set({ rounds: res.data });
      toast.success("Test Created Successfully!");
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error(error.response?.data?.message || "Failed to create test");
    }
    set({ isLoadingRounds: false });
  },
  getRounds: async (id) => {
    set({ isLoadingRounds: true });
    try {
      const res = await axiosInstance.post("/tests/get-rounds", { id });
      console.log("Get Rounds Response: ", res.data);
      set({ rounds: res.data });
    } catch (error) {
      console.error("Error fetching rounds:", error);
      toast.error(error.response?.data?.message || "Failed to fetch rounds");
    }
    set({ isLoadingRounds: false });
  },
  getTests: async (id) => {
  set({ isLoadingRounds: true });
  try {
    // This hits http://localhost:5004/api/tests/get-tests
    const res = await axiosInstance.post("/tests/get-tests", { id }); 
    set({ tests: res.data });
  } catch (error) {
    console.error("Error:", error);
  }
  set({ isLoadingRounds: false });
},
}));