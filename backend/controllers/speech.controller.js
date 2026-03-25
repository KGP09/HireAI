import axios from "axios";
import SpeechPracticeSession from "../Models/speechPracticeSession.model.js";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

const PREDEFINED_TOPICS = {
  Behavioral: {
    Easy: [
      "Describe a time you worked well with a teammate.",
      "Tell me about a small win you are proud of.",
      "Share a time you helped someone at work.",
    ],
    Medium: [
      "Describe a time you handled conflict in a team.",
      "Tell me about a time you received difficult feedback. How did you respond?",
      "Share a situation where you had to adapt quickly to change.",
    ],
    Hard: [
      "Describe a time you had to make an unpopular decision. How did you handle it?",
      "Tell me about a time you failed at something important. What did you learn?",
      "Describe a situation where you had to influence stakeholders with conflicting priorities.",
    ],
  },
  "Technical Explanation": {
    Easy: [
      "Explain how the internet works to a 10 year old.",
      "Explain what an API is to a non-technical friend.",
      "Explain what a database is and why we use it.",
    ],
    Medium: [
      "Explain how a REST API works to a junior developer.",
      "Explain the difference between synchronous and asynchronous code with an example.",
      "Explain how authentication and authorization differ, with real-world examples.",
    ],
    Hard: [
      "Explain how a load balancer works in a distributed system.",
      "Explain eventual consistency to a product manager.",
      "Explain how you would design a rate-limiting system for a public API.",
    ],
  },
  "Product Thinking": {
    Easy: [
      "How would you improve a to-do list app for busy students?",
      "Pick your favorite app and describe one small improvement you would make.",
      "How would you make an online food delivery app easier to use?",
    ],
    Medium: [
      "How would you improve Uber for new users in a city?",
      "How would you improve the onboarding experience of a productivity app?",
      "Design a simple app to help people build better daily habits.",
    ],
    Hard: [
      "How would you improve Uber to increase driver satisfaction without hurting rider experience?",
      "How would you design a feature to reduce churn in a subscription-based SaaS product?",
      "If sign-ups dropped by 20% this week, how would you investigate and respond?",
    ],
  },
  Debate: {
    Easy: [
      "Should homework be banned in schools?",
      "Is it better to work from home or from the office?",
      "Should companies allow flexible working hours?",
    ],
    Medium: [
      "Should companies adopt a 4 day work week?",
      "Is remote work truly as productive as in-office work?",
      "Should interview processes rely heavily on algorithmic coding challenges?",
    ],
    Hard: [
      "Should AI systems be allowed to make hiring recommendations?",
      "Is it ethical for companies to use candidate data for long-term profiling?",
      "Should governments regulate the use of AI in recruitment?",
    ],
  },
};

const ALL_CATEGORIES = Object.keys(PREDEFINED_TOPICS);

const FALLBACK_FILLERS = [
  "um",
  "uh",
  "like",
  "you know",
  "actually",
  "basically",
  "sort of",
  "kind of",
  "right",
  "okay",
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const generateSpeechTopic = async (req, res) => {
  try {
    let { category, difficulty } = req.body;

    category = category || "Random";
    difficulty = difficulty || "Medium";

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      difficulty = "Medium";
    }

    let resolvedCategory = category;
    if (category === "Random" || !PREDEFINED_TOPICS[category]) {
      resolvedCategory = pickRandom(ALL_CATEGORIES);
    }

    // First try Ollama for a dynamic topic
    try {
      const prompt = `Generate a single short impromptu speaking topic for interview preparation.
Category: ${resolvedCategory}.
Difficulty: ${difficulty}.

The topic should:
- Be 1 concise sentence.
- Be suitable for a ${difficulty.toLowerCase()}-level candidate.
- Not include instructions like "talk about" or "describe" in meta form, just the topic itself.

Return ONLY the topic sentence, no quotes, no extra text.`;

      const ollamaRes = await axios.post(OLLAMA_URL, {
        model: "llama3",
        prompt,
        stream: false,
      });

      let topic = (ollamaRes.data?.response || "").trim();

      // Some models wrap content in quotes or markdown; strip them
      if (topic.startsWith('"') && topic.endsWith('"')) {
        topic = topic.slice(1, -1);
      }

      if (topic.length > 0) {
        return res.status(200).json({
          topic,
          category: resolvedCategory,
          difficulty,
          source: "ai",
        });
      }
    } catch (err) {
      console.error("⚠️ Ollama topic generation failed, using fallback:", err.message);
    }

    // Fallback to predefined topics
    const topicsByCategory = PREDEFINED_TOPICS[resolvedCategory] || PREDEFINED_TOPICS.Behavioral;
    const pool =
      topicsByCategory[difficulty] ||
      topicsByCategory.Medium ||
      PREDEFINED_TOPICS.Behavioral.Medium;

    const topic = pickRandom(pool);

    return res.status(200).json({
      topic,
      category: resolvedCategory,
      difficulty,
      source: "fallback",
    });
  } catch (error) {
    console.error("🔥 Topic generation error:", error);
    return res.status(500).json({ message: "Failed to generate topic" });
  }
};

export const analyzeSpeechResponse = async (req, res) => {
  try {
    const { topic, transcript, category, duration } = req.body;

    if (!topic || !transcript) {
      return res.status(400).json({ message: "Topic and transcript are required" });
    }

    const userId = req.user?._id;

    let scores = {
      clarity: 0,
      structure: 0,
      confidence: 0,
      conciseness: 0,
    };
    let fillerWords = [];
    let strengths = [];
    let improvementSuggestions = [];

    // Try AI evaluation first
    try {
      const prompt = `
Evaluate the following interview speaking response.

Topic: ${topic}
Category: ${category || "Unspecified"}
Duration (seconds): ${duration || "Unknown"}

Response:
"""${transcript}"""

You are an expert communication coach. Return a STRICT JSON object with this exact shape:
{
  "clarityScore": number (1-10),
  "structureScore": number (1-10),
  "confidenceScore": number (1-10),
  "concisenessScore": number (1-10),
  "fillerWords": [
    { "word": string, "count": number }
  ],
  "strengths": [string],
  "improvementSuggestions": [string]
}

Rules:
- Only return valid JSON, no comments or markdown.
- If you cannot detect any filler words, return an empty array for "fillerWords".
`;

      const ollamaRes = await axios.post(OLLAMA_URL, {
        model: "llama3",
        prompt,
        stream: false,
        format: "json",
      });

      const raw = ollamaRes.data?.response;
      const parsed =
        typeof raw === "string" ? JSON.parse(raw) : raw;

      scores = {
        clarity: parsed.clarityScore ?? 0,
        structure: parsed.structureScore ?? 0,
        confidence: parsed.confidenceScore ?? 0,
        conciseness: parsed.concisenessScore ?? 0,
      };

      fillerWords = Array.isArray(parsed.fillerWords) ? parsed.fillerWords : [];
      strengths = Array.isArray(parsed.strengths) ? parsed.strengths : [];
      improvementSuggestions = Array.isArray(parsed.improvementSuggestions)
        ? parsed.improvementSuggestions
        : [];
    } catch (aiErr) {
      console.error("⚠️ Ollama analysis failed, using heuristic fallback:", aiErr.message);

      const words = transcript.split(/\s+/).filter(Boolean);
      const wordCount = words.length;

      const fillerCounts = {};
      for (const filler of FALLBACK_FILLERS) {
        const regex = new RegExp(`\\b${filler.replace(" ", "\\s+")}\\b`, "gi");
        const matches = transcript.match(regex);
        if (matches && matches.length > 0) {
          fillerCounts[filler] = matches.length;
        }
      }

      fillerWords = Object.entries(fillerCounts).map(([word, count]) => ({
        word,
        count,
      }));

      // Very rough heuristic scores
      scores = {
        clarity: Math.max(3, 10 - fillerWords.length),
        structure: 6,
        confidence: 6,
        conciseness: wordCount > 180 ? 5 : 8,
      };

      strengths = [
        "Completed the full response without stopping.",
        "Demonstrated willingness to articulate thoughts under time pressure.",
      ];

      improvementSuggestions = [
        "Reduce filler words such as 'um' and 'like' to sound more confident.",
        "Organize your answer into a clear beginning, middle, and end.",
      ];
    }

    // Persist the session for analytics / history
    if (userId) {
      try {
        await SpeechPracticeSession.create({
          userId,
          topic,
          category: category || "Random",
          transcript,
          scores,
          fillerWords,
          duration: duration || 0,
        });
      } catch (persistErr) {
        console.error("⚠️ Failed to save speech session:", persistErr.message);
      }
    }

    return res.status(200).json({
      scores,
      fillerWords,
      strengths,
      improvementSuggestions,
    });
  } catch (error) {
    console.error("🔥 Speech analysis error:", error);
    return res.status(500).json({ message: "Failed to analyze response" });
  }
};

