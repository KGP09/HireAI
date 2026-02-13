import express from "express";
import { createTest, getNextQuestion, analyzeInterview } from "../controllers/ai.controller.js";
import { protectRoute } from "../middlewares/protectedRoute.js"; // Ensure this path is correct

const router = express.Router();

router.post("/create-rounds", protectRoute, createTest);
router.post("/interview", protectRoute, getNextQuestion); // Match!
router.post("/analyze", protectRoute, analyzeInterview);

export default router;