import dotenv from "dotenv";
import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import User from "../models/user.model.js";
import { Ollama } from "ollama";
import History from "../Models/history.model.js";

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

// export const getNextQuestion = async (req, res) => {
//   try {
//     const { userResponse, jobDescription, history = [] } = req.body;

//     if (!userResponse) {
//       return res.status(400).json({ message: "User response is required" });
//     }

//     // 1. Initialize the client
//     const ollamaClient = new Ollama({ host: 'http://127.0.0.1:11434' });

//     // 2. Prepare the messages
//     const messages = [
//       {
//         role: 'system',
//         content: `You are a strict technical interviewer for a ${jobDescription} role. 
//         Analyze the user's answer and ask ONE specific, challenging follow-up question. 
//         Keep your response under 25 words.`
//       },
//       ...history, 
//       { role: 'user', content: userResponse }
//     ];

//     // 3. Call the chat method on the instance
//     const response = await ollamaClient.chat({
//       model: 'llama3', 
//       messages: messages,
//     });

//     return res.status(200).json({ 
//       question: response.message.content 
//     });

//   } catch (error) {
//     // This will catch if llama3 isn't pulled or Ollama is off
//     console.error("Detailed AI Error:", error);
//     return res.status(500).json({ 
//       message: "AI Agent Error", 
//       error: error.message 
//     });
//   }
// };

export const getNextQuestion = async (req, res) => {
  try {
    const { userResponse, jobDescription, history = [] } = req.body;

    if (!userResponse) {
      return res.status(400).json({ message: "User response is required" });
    }

    // 1. Calculate depth to give the AI a 'nudge' if the interview is getting long
    const turnCount = history.filter(m => m.role === 'user').length;
    let timingInstruction = "Keep the interview going with deep technical questions.";
    
    if (turnCount >= 5) {
      timingInstruction = "You have enough information. If the user's last answer was sufficient, wrap up the interview now.";
    }

    const ollamaClient = new Ollama({ host: 'http://127.0.0.1:11434' });

    // 2. Updated System Prompt for "Dynamic Termination"
    const messages = [
      {
        role: 'system',
        content: `You are a professional technical interviewer for a ${jobDescription} role.

        STRICT INSTRUCTIONS:
        - Do NOT repeat, summarize, or give feedback on the user's answer.
        - Move immediately to the next topic or follow-up.
        - ${timingInstruction}
        - If continuing: Ask EXACTLY ONE specific technical question. No "Great job" or "That's correct" filler.
        - If ending: Start with "[FINISH]" then a 1-sentence closing.
        - MAX LENGTH: 25 words. Be brief and direct.`
      },
      ...history, 
      { role: 'user', content: userResponse }
    ];

    const response = await ollamaClient.chat({
      model: 'llama3', 
      messages: messages,
    });

    const aiContent = response.message.content;

    // 3. Check if the AI decided to end the interview
    const isFinished = aiContent.includes("[FINISH]");

    // Clean the message for the frontend (remove the hidden tag)
    const cleanedQuestion = aiContent.replace("[FINISH]", "").trim();

    return res.status(200).json({ 
      question: cleanedQuestion,
      isFinished: isFinished, // Frontend uses this to stop the chat and move to results
      turnCount: turnCount + 1
    });

  } catch (error) {
    console.error("Detailed AI Error:", error);
    return res.status(500).json({ 
      message: "AI Agent Error", 
      error: error.message 
    });
  }
};

export const analyzeInterview = async (req, res) => {
  try {
    const { chatHistory, jobDescription, id } = req.body; // Added 'id' to find the user

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

    // --- PERSISTENCE LOGIC ---
    // Option A: Save to a separate History collection (Cleanest for huge logs)
    const newHistory = new History({
      userEmail: req.body.email || "unknown", // Optional: if you pass email from frontend
      role: jobDescription,
      overallScore: report.overallScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      feedback: report.feedback,
      chatHistory: chatHistory,
      date: new Date()
    });
    await newHistory.save();

    // Option B: Also update the User document if you keep a 'tests' array there
    const user = await User.findById(id);
    if (user) {
      // Create a test object that matches your createTest format
      const completedTest = {
        testName: `${jobDescription} Mock Interview`,
        numberOfRounds: 1,
        rounds: [{
          description: "Live AI Interview",
          roundType: "Technical Round",
          score: report.overallScore,
          feedback: report.feedback,
          status: true // Mark as completed
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

