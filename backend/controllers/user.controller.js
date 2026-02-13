import { Ollama } from "ollama";
// 1. Corrected path and added .js extension
import History from "../Models/history.model.js";

export const saveHistoryController = async (req, res) => {
  try {
    const { transcript, feedback, jobDescription } = req.body;
    const userId = req.user._id;

    // Force the score to be a Number so your Dashboard math works
    if (feedback && feedback.score) {
      feedback.score = Number(feedback.score); 
    }

    const newEntry = new History({
      userId,
      jobDescription,
      transcript,
      feedback
    });

    await newEntry.save();
    res.status(201).json({ message: "Interview saved to history!" });
  } catch (error) {
    console.error("Database Save Error:", error);
    res.status(500).json({ message: "Failed to save history" });
  }
};

export const generateFeedbackController = async (req, res) => {
  try {
    const { transcript, jobDescription } = req.body;

    const ollamaClient = new Ollama({ host: 'http://127.0.0.1:11434' });

    const prompt = `
      Analyze this technical interview transcript for a ${jobDescription} position.
      TRANSCRIPT: ${JSON.stringify(transcript)}
      
      Provide a JSON response with the following keys:
      - score: (A number 1-100)
      - strengths: (Array of 3 strings)
      - weaknesses: (Array of 3 strings)
      - summary: (A 2-sentence overall evaluation)
      
      Return ONLY valid JSON.
    `;

    const response = await ollamaClient.chat({
      model: 'llama3', 
      messages: [{ role: 'user', content: prompt }],
      format: 'json' 
    });

    const report = JSON.parse(response.message.content);
    res.status(200).json(report);
  } catch (error) {
    console.error("Feedback Generation Error:", error);
    res.status(500).json({ message: "Analysis failed" });
  }
};

export const getMyHistoryController = async (req, res) => {
  try {
    // 3. Ensuring we find by userId
    const history = await History.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve history" });
  }
};