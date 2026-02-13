// import express from "express";
// import User from "../models/user.model.js";
// import History from "../Models/history.model.js";
// import { generateFeedbackController, getMyHistoryController, saveHistoryController } from "../controllers/user.controller.js";
// import { protectRoute } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // 1. Get User Profile & Test Summaries (For the main Dashboard stats)
// router.get("/profile/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// });

// // 2. Get Detailed Interview History (For the "Previous Interviews" list)
// router.get("/history/:email", async (req, res) => {
//   try {
//     const history = await History.find({ userEmail: req.params.email }).sort({ date: -1 });
//     res.status(200).json(history);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching history", error: error.message });
//   }
// });

// // 1. Route to analyze the final transcript
// router.post("/generate-feedback", protectRoute, generateFeedbackController);

// // 2. Route to save everything to history.model.js
// router.post("/save-history", protectRoute, saveHistoryController);
// router.get("/my-history", protectRoute, getMyHistoryController);
// export default router;

import express from "express";
import User from "../models/user.model.js";
import History from "../Models/history.model.js";
import { 
  generateFeedbackController, 
  getMyHistoryController, 
  saveHistoryController 
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/protectedRoute.js";

const router = express.Router();

// --- PROTECTED ROUTES (Require Login) ---

// 1. Get the current user's profile
router.get("/profile", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 2. The ONLY history route you need
// This handles BOTH the dashboard stats and the history list
router.get("/my-history", protectRoute, getMyHistoryController);

// 3. AI Feedback and Saving
router.post("/generate-feedback", protectRoute, generateFeedbackController);
router.post("/save-history", protectRoute, saveHistoryController);

export default router;