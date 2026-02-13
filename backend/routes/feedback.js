const express = require("express");
const router = express.Router();
const axios = require("axios");
const History = require("../Models/history.model"); 

router.post("/final", async (req, res) => {
  const { history, userEmail, role } = req.body;

  const analysisPrompt = `
    You are an expert technical recruiter. Analyze this interview transcript for a ${role} position.
    Provide a strict JSON response:
    {
      "overallScore": number (0-100),
      "strengths": ["list 3 specific strengths"],
      "weaknesses": ["list 3 specific areas for improvement"],
      "feedback": "2-3 sentences of summary"
    }
    Transcript: ${JSON.stringify(history)}
  `;

  try {
    // 1. Get AI Analysis from Ollama/Mistral
    const aiResponse = await axios.post("http://localhost:11434/api/generate", {
      model: "mistral", 
      prompt: analysisPrompt,
      stream: false,
      format: "json"
    });

    const reportData = JSON.parse(aiResponse.data.response);

    // 2. Save to Database using the History model
    const newEntry = new History({
      userEmail,
      role,
      overallScore: reportData.overallScore,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      feedback: reportData.feedback,
      chatHistory: history
    });
    
    await newEntry.save(); // This persists the data to MongoDB

    res.json(reportData);
  } catch (error) {
    console.error("Analysis/Save Error:", error);
    res.status(500).json({ error: "Failed to finalize interview" });
  }
});

module.exports = router;