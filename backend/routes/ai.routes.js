import express from "express";
import { createTest, getNextQuestion, analyzeInterview, generateRound, transcribeAudio, evaluateTelephonic } from "../controllers/ai.controller.js";
import { protectRoute } from "../middlewares/protectedRoute.js";
import multer from "multer";

const router = express.Router();

router.post("/create-rounds", protectRoute, createTest);
router.post("/interview", protectRoute, getNextQuestion);
router.post("/analyze", protectRoute, analyzeInterview);
// ai.routes.js
router.post("/generate-round", protectRoute, generateRound);
const upload = multer({ storage: multer.memoryStorage() }); // Store in RAM

// Ensure the field name 'audio' matches the formData.append("audio", ...) in Telephonic.jsx
router.post("/transcribe", protectRoute, upload.single("audio"), transcribeAudio);

router.post("/generate-round", protectRoute, generateRound);

router.post("/evaluate-telephonic", protectRoute, evaluateTelephonic);
export default router;