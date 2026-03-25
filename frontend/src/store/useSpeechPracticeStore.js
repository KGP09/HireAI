import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useSpeechPracticeStore = create((set) => ({
  currentTopic: null,
  isGeneratingTopic: false,
  isAnalyzing: false,

  generateTopic: async ({ category, difficulty }) => {
    set({ isGeneratingTopic: true });
    try {
      const res = await axiosInstance.post("/speech/topic", {
        category,
        difficulty,
      });
      const data = res.data;
      set({
        currentTopic: {
          topic: data.topic,
          category: data.category,
          difficulty: data.difficulty,
          source: data.source,
        },
      });
      return data;
    } catch (error) {
      console.error("Speech topic error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to generate topic. Please try again."
      );
      throw error;
    } finally {
      set({ isGeneratingTopic: false });
    }
  },

  analyzeResponse: async ({ topic, transcript, category, duration }) => {
    set({ isAnalyzing: true });
    try {
      const res = await axiosInstance.post("/speech/analyze", {
        topic,
        transcript,
        category,
        duration,
      });
      return res.data;
    } catch (error) {
      console.error("Speech analysis error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to analyze response. Please try again."
      );
      throw error;
    } finally {
      set({ isAnalyzing: false });
    }
  },
}));

