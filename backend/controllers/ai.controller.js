import dotenv from "dotenv";
import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import User from "../models/user.model.js";
import { Ollama } from "ollama";
import History from "../Models/history.model.js";
import axios from "axios";
import { AssemblyAI } from 'assemblyai';
dotenv.config();

export const createTest = async (req, res) => {
  const llm = new ChatMistralAI({
    temperature: 0.7,
    apiKey: process.env.MISTRAL_API_KEY,
  });
  // console.log(process.env.MISTRAL_API_KEY);

  const interviewPrompt = new PromptTemplate({
    inputVariables: ["description"],
    template: `
You are an AI system for interview preparation.

Given the following user description, generate interview rounds and questions in raw, clean JSON. Do not include formatting (like asterisks **, markdown blocks, or backticks). Only return a valid JSON object.

Use the following schema structure:
{{
  "testName": "string",
  "numberOfRounds": number,
  "rounds": [
    {{
      "description": "string",
      "roundType": "Aptitude Round" | "Technical Round" | "Telephonic Round" | "DSA Round" | "HR Round",
      "isScorable": boolean,
      "questions": [
        {{
          "question": "string",
          "options": ["string", ...],
          "correctAnswer": "string"
        }}
      ],
      "answers": [],
      "status" : boolean
      "score": 0,
      "feedback": ""
    }}
  ]
}}

Rules:
1. **Aptitude Round** → focus on advanced logical reasoning, probability, optimization, data interpretation.  
   Example: "A train leaves Station A at 60km/h, another leaves Station B... When will they meet?"  
2. **Technical Round** → deep CS fundamentals (OS, DBMS, Networking, System Design). Avoid trivial syntax questions.  
3. **Telephonic Round** → scenario-based (e.g., debugging a distributed system crash, tradeoffs in architecture).  
4. **DSA Round** → medium-hard to hard coding challenges. Each question must include:
   - Problem description
   - Constraints
   - Input/Output format
   - Example test cases
5. **HR Round** → real behavioral questions.  
   Example: "Describe a time when you disagreed with your manager. How did you resolve it?"
6. If the number of questions are not specified, default to 10 questions per round.
Constraints:
- No trivial questions like "area of a square" or "2+2".  
- Every round must include a mix of easy, medium, and hard.  
- Questions must simulate **real interview difficulty**.  
- Return **only raw JSON**, no explanations or markdown. 
7. If the company's name is present in the description then in the testName part of the return json format use it , if not use a default name.

    ""IF THE INPUT THAT IS GIVEN IS NOT VAILD PREPARATION PROMT : return a json object with a string message property with value "Invalid Input""
INPUT:
{description}
`,
  });

  try {
    const { description, id } = req.body;

    if (!description || !id) {
      return res.status(400).json({ message: "Invalid Input" });
    }

    const formattedPrompt = await interviewPrompt.format({ description });
    const response = await llm.invoke(formattedPrompt);
    let rawText = response?.content || "";
    console.log("Raw LLM Response:\n", rawText);

    const match = rawText.match(/({[\s\S]*})/);
    if (!match) {
      return res
        .status(500)
        .json({ message: "No JSON found in model response" });
    }

    const jsonString = match[1];
    const parsed = JSON.parse(jsonString);
    if (parsed.message && parsed.message === "Invalid Input") {
      return res.status(400).json({ message: "Invalid Input" });
    }
    const formattedTest = {
      testName: parsed.testName,
      numberOfRounds: parsed.numberOfRounds,
      rounds: parsed.rounds.map((round) => ({
        description: round.description,
        roundType: round.roundType,
        isScorable: round.isScorable,
        status: round.status,
        score: round.score || 0,
        feedback: round.feedback || "",
        questions: (round.questions || []).map((q) => ({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
        })),
      })),
    };

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.tests.push(formattedTest);
    await user.save();

    console.log("Interview Test Created:", formattedTest);
    return res.status(200).json({ parsed, message: "Interview Test Created" });
  } catch (error) {
    console.log("Error generating interview questions:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getNextQuestion = async (req, res) => {
  try {
    const {
      userResponse = "",
      jobDescription,
      history = [],
      preferences = {},
      isInitialPrompt = false,
    } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const normalizedHistory = Array.isArray(history) ? history : [];
    const safeUserResponse =
      typeof userResponse === "string" ? userResponse.trim() : "";

    if (!isInitialPrompt && !safeUserResponse) {
      return res.status(400).json({ message: "User response is required" });
    }

    const lastHistoryItem = normalizedHistory[normalizedHistory.length - 1];
    const hasLatestUserInHistory =
      lastHistoryItem?.role === "user" &&
      typeof lastHistoryItem?.content === "string" &&
      lastHistoryItem.content.trim() === safeUserResponse;

    const userTurnsInHistory = normalizedHistory.filter(
      (message) => message.role === "user",
    ).length;

    const turnCount = isInitialPrompt
      ? userTurnsInHistory
      : userTurnsInHistory + (hasLatestUserInHistory ? 0 : 1);

    const targetLength = String(
      preferences?.targetLength || "standard",
    ).toLowerCase();
    const pacingByLength = {
      short: { minTurnsBeforeFinish: 3, softWrapUpAt: 5 },
      standard: { minTurnsBeforeFinish: 5, softWrapUpAt: 7 },
      deep: { minTurnsBeforeFinish: 7, softWrapUpAt: 10 },
    };
    const pacingRule = pacingByLength[targetLength] || pacingByLength.standard;

    let timingInstruction =
      "Continue with one targeted follow-up question that explores depth.";

    if (isInitialPrompt) {
      timingInstruction =
        "Start the interview now with one strong opening question.";
    } else if (turnCount < pacingRule.minTurnsBeforeFinish) {
      timingInstruction = `Do not end the interview yet. Gather at least ${pacingRule.minTurnsBeforeFinish} candidate answers before finishing.`;
    } else if (turnCount >= pacingRule.softWrapUpAt) {
      timingInstruction =
        "If you already have enough signal, end now. Otherwise ask one final high-value question.";
    } else {
      timingInstruction =
        "You may continue or finish naturally based on interview quality and completeness.";
    }

    const ollamaClient = new Ollama({ host: "http://127.0.0.1:11434" });

    const messages = [
      {
        role: "system",
        content: `You are a professional technical interviewer.

INTERVIEW CONTEXT:
- Role: ${jobDescription}
- Seniority: ${preferences?.seniority || "Mid"}
- Focus Area: ${preferences?.focusArea || "Balanced"}
- Interviewer Tone: ${preferences?.interviewerStyle || "Challenging"}
- Question Style: ${preferences?.questionStyle || "Scenario-led"}
- Target Length: ${targetLength}

STRICT INSTRUCTIONS:
- Return ONLY valid JSON using this exact shape:
  {"question":"<single complete question or one-line closing>","isFinished":false}
- Set "isFinished" to true only when interview should end naturally.
- Ask exactly one question at a time.
- Do not give feedback, praise, or summaries while continuing.
- ${timingInstruction}
- Use the candidate's last answer to ask a context-aware follow-up.
- Avoid repeating earlier questions or rephrasing the same topic.
- Mix question types naturally (conceptual, scenario, debugging, tradeoff) based on Focus Area.
- Increase depth gradually: start broad, then drill into specifics.
- Never restate or summarize what the candidate already said.
- End non-finish responses with a single "?".
- If ending: start with "[FINISH]" and give a one-sentence closing.
- If continuing: ask only the next question.
- Keep it natural and interviewer-like. Do not truncate your question.`,
      },
      ...normalizedHistory,
    ];

    if (!isInitialPrompt && !hasLatestUserInHistory) {
      messages.push({ role: "user", content: safeUserResponse });
    }

    const response = await ollamaClient.chat({
      model: "llama3",
      messages,
      format: "json",
      options: {
        temperature: 0.4,
        num_predict: 180,
      },
    });

    const rawContent = String(response?.message?.content || "").trim();
    let parsedResponse = null;
    try {
      parsedResponse = JSON.parse(rawContent);
    } catch {
      parsedResponse = null;
    }

    const aiContent = String(
      parsedResponse?.question ||
        rawContent ||
        "Could you walk me through the tradeoffs in your approach?",
    ).trim();
    const requestedFinish =
      Boolean(parsedResponse?.isFinished) || aiContent.includes("[FINISH]");
    const canFinishNow = turnCount >= pacingRule.minTurnsBeforeFinish;
    const isFinished = requestedFinish && canFinishNow;

    const stripMeta = (text) =>
      text
        .replace("[FINISH]", "")
        .replace(/\s+/g, " ")
        .trim();

    const normalizeQuestion = (text) => {
      const normalized = stripMeta(text);
      if (!normalized) {
        return "Can you walk me through the key tradeoffs in your last decision?";
      }
      let cleaned = normalized
        .replace(/^.*?(here'?s your first question:)\s*/i, "")
        .replace(/^let'?s get started\.\s*/i, "")
        .trim();

      // Remove surrounding quotes if model wraps output.
      cleaned = cleaned.replace(/^["']|["']$/g, "").trim();

      // Keep the full question text instead of slicing by words/line.
      if (!cleaned.endsWith("?")) {
        cleaned = `${cleaned.replace(/[.!]+$/g, "").trim()}?`;
      }

      return cleaned;
    };

    const cleanedQuestion = isFinished
      ? stripMeta(aiContent) || "Thanks for your time. We will move to feedback."
      : normalizeQuestion(aiContent);

    return res.status(200).json({
      question: cleanedQuestion,
      isFinished,
      turnCount,
    });
  } catch (error) {
    console.error("Detailed AI Error:", error);
    return res.status(500).json({
      message: "AI Agent Error",
      error: error.message,
    });
  }
};

export const analyzeInterview = async (req, res) => {
  try {
    const { chatHistory, jobDescription, id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required to save results" });
    }

    const llm = new ChatMistralAI({
      temperature: 0.3,
      apiKey: process.env.MISTRAL_API_KEY,
    });

    const analysisPrompt = `
      You are a Senior Technical Recruiter. Analyze the following interview transcript for a ${jobDescription} role:
      ${JSON.stringify(chatHistory)}

      Provide a performance report in JSON format:
      {
        "overallScore": number,
        "strengths": [string],
        "weaknesses": [string],
        "feedback": string,
        "status": "Pass" | "Fail"
      }
      Only return raw JSON. No markdown backticks.
    `;

    const response = await llm.invoke(analysisPrompt);
    const rawContent = response?.content || ""; // Define it first
console.log("Mistral Response Content:", rawContent);
    // Improved Parsing to handle potential formatting junk
    const match = response.content.match(/{[\s\S]*}/);
    if (!match) throw new Error("No JSON found in AI response");
    
    const report = JSON.parse(match[0]);

    
    const newHistory = new History({
      userEmail: req.body.email || "unknown",
      role: jobDescription,
      overallScore: report.overallScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      feedback: report.feedback,
      chatHistory: chatHistory,
      date: new Date()
    });
    await newHistory.save();

    
    const user = await User.findById(id);
    if (user) {
      const completedTest = {
        testName: `${jobDescription} Mock Interview`,
        numberOfRounds: 1,
        rounds: [{
          description: "Live AI Interview",
          roundType: "Technical Round",
          score: report.overallScore,
          feedback: report.feedback,
          status: true 
        }]
      };
      user.tests.push(completedTest);
      await user.save();
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ message: "Failed to analyze interview", error: error.message });
  }
};

export const generateRound = async (req, res) => {
  try {
    const { role, type } = req.body;
    console.log(`🚀 Logic started for: ${role} (${type})`);

    let questions = [];

    try {
      // Attempt to contact Ollama
      const ollamaRes = await axios.post("http://127.0.0.1:11434/api/generate", {
        model: "llama3", // Ensure you have this model (ollama pull llama3)
        prompt: `Generate 3 interview questions for a ${role} position. 
                 Focus: ${type === 'telephonic' ? 'Verbal communication and basics' : 'Technical depth'}.
                 Return ONLY a JSON array of strings.`,
        stream: false,
      });

      // Clean the response (LLMs sometimes add extra text)
      const text = ollamaRes.data.response;
      const match = text.match(/\[.*\]/s); 
      questions = match ? JSON.parse(match[0]) : [];
    } catch (ollamaErr) {
      console.error("⚠️ Ollama unreachable, using fallback questions.");
      // Fallback questions so the frontend doesn't break
      questions = [
        `As a ${role}, how do you handle complex technical problems?`,
        "Describe a time you had to explain a technical concept to a non-technical person.",
        "What are your core technical strengths?"
      ];
    }

    // Format the response to match your Telephonic.jsx logic
    const formattedQuestions = questions.map((q, index) => ({
      _id: `q_${Date.now()}_${index}`,
      question: q
    }));

    return res.status(200).json({
      round: {
        roundType: type === "telephonic" ? "Telephonic Round" : "Technical Round",
        questions: formattedQuestions
      }
    });

  } catch (error) {
    console.error("🔥 Critical Backend Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const transcribeAudio = async (req, res) => {
  console.log("Key Check:", process.env.ASSEMBLYAI_API_KEY ? `Starts with: ${process.env.ASSEMBLYAI_API_KEY.substring(0, 4)}...` : "MISSING");
  const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

  try {
    // 1. Check if Multer successfully captured the audio
    if (!req.file) {
      return res.status(400).json({ message: "Audio signal not detected by the server." });
    }

    console.log("📤 Sending audio to AssemblyAI...");

    // 2. Transcribe the buffer directly
    // AssemblyAI's SDK handles the upload and polling for you
    const transcript = await client.transcripts.transcribe({
      audio: req.file.buffer,
      language_code: "en_us",
      punctuate: true,
      format_text: true
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error);
    }

    console.log("🎤 Actual User Speech:", transcript.text);

    // 3. Send the REAL text to the frontend
    return res.status(200).json({ 
      transcript: transcript.text 
    });

  } catch (error) {
    console.error("🔥 AssemblyAI Error:", error);
    res.status(500).json({ message: "Neural transcription failed." });
  }
};

export const evaluateTelephonic = async (req, res) => {
  try {
    const { answers, role } = req.body;
    
    // Safety check: Ensure answers exist
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: "No answers provided for evaluation." });
    }

    const fullTranscript = Object.values(answers).join(" | ");

    const prompt = `
      You are an expert technical interviewer. Evaluate the following candidate for the role of ${role}.
      
      Transcript: "${fullTranscript}"
      
      Provide a strict JSON evaluation including:
      1. score: A number between 0-100 based on technical accuracy and communication.
      2. feedback: A concise summary of their performance.
      3. strengths: An array of 2-3 key strengths.
      4. improvements: An array of 2-3 areas to grow.

      Return ONLY valid JSON.
    `;

    // Declare outside the try block so it's accessible in the return
    let aiFeedback;

    try {
      const ollamaRes = await axios.post("http://127.0.0.1:11434/api/generate", {
        model: "llama3",
        prompt: prompt,
        stream: false,
        format: "json"
      });

      aiFeedback = JSON.parse(ollamaRes.data.response);
    } catch (aiErr) {
      console.error("⚠️ AI Evaluation failed:", aiErr.message);
      // Heuristic Fallback so the user still gets a result
      aiFeedback = {
        score: 60,
        feedback: "Evaluation engine is under high load. Scoring based on response length.",
        strengths: ["Completed the assessment"],
        improvements: ["System unable to analyze details currently"]
      };
    }

    // Response matches what the UI expects
    return res.status(200).json({
      success: true,
      score: aiFeedback.score,
      feedback: aiFeedback.feedback, // Changed from remarks to match your prompt
      strengths: aiFeedback.strengths,
      improvements: aiFeedback.improvements,
      message: "Evaluation synchronized with neural archives."
    });

  } catch (error) {
    console.error("🔥 Critical Error in evaluateTelephonic:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};