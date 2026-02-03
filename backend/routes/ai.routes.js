import express from "express";
import {
  //   answers,
  createTest,
  getNextQuestion,
  //   questions,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/create-rounds", createTest);
router.post("/interview", getNextQuestion);
export default router;