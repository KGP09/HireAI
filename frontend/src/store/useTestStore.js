import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
const BASE_URL =
  import.meta.env.MODE && import.meta.env.MODE === "development"
    ? "http://localhost:5004"
    : "/";

export const useTestStore = create((set, get) => ({
  testIndex: null,
  roundIndex: null,
  roundType: null,
  questions: null,
  answers: null,
  score: null,
  feedback: null,
  evaluate: async (data) => {
    try {
      const res = await axiosInstance.post("/tests/evaluate-test", data);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  },
}));