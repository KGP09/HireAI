import express from "express";
import { protectRoute } from "../middlewares/protectedRoute.js";
import {
  generateSpeechTopic,
  analyzeSpeechResponse,
} from "../controllers/speech.controller.js";

const router = express.Router();

router.post("/topic", protectRoute, generateSpeechTopic);
router.post("/analyze", protectRoute, analyzeSpeechResponse);

export default router;

