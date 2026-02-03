import React, { useState, useRef } from "react"; // Added useRef here
import Webcam from "react-webcam";
import { axiosInstance } from "../lib/axios";

const InterviewPage = () => {
  const [transcript, setTranscript] = useState("");
  const [aiQuestion, setAiQuestion] = useState(
    "Hello! I am your AI interviewer. Click 'Speak Answer' to begin.",
  ); // Added state
  const [questionCount, setQuestionCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const MAX_QUESTIONS = 5; // Change this to whatever limit you want
  const [isAiThinking, setIsAiThinking] = useState(false);

  const recognitionRef = useRef(null);

  const startListening = () => {
    if (recognitionRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser not supported. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setTranscript("Listening...");
    };

    recognition.onresult = async (event) => {
      const userText = event.results[0][0].transcript;
      setTranscript(userText);
      // We call the backend directly here
      await sendToBackend(userText);
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const sendToBackend = async (text) => {
    // 1. Check if we should end the interview
    if (questionCount >= MAX_QUESTIONS) {
      setIsFinished(true);
      const endMessage =
        "Thank you for your time. The interview is now complete. You can view your results in the dashboard.";
      setAiQuestion(endMessage);
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(endMessage));
      return;
    }

    setIsAiThinking(true);
    try {
      // Pass the count to the backend so the AI knows we are near the end
      const response = await axiosInstance.post("/ai/interview", {
        userResponse: text,
        jobDescription: "React Developer",
        currentRound: questionCount + 1,
      });

      const nextQuestion = response.data.question;
      setAiQuestion(nextQuestion);

      // Update the counter
      setQuestionCount((prev) => prev + 1);

      const utterance = new SpeechSynthesisUtterance(nextQuestion);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Interview Error:", error);
      setAiQuestion("Sorry, I encountered an error. Is Ollama running?");
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="h-screen bg-gray-950 p-8 flex flex-col gap-6 text-white font-sans">
      <div className="flex flex-1 gap-6">
        {/* Box 1: AI Agent */}
        <div className="flex-1 rounded-2xl border-2 border-blue-500/30 bg-gray-900 relative flex items-center justify-center overflow-hidden shadow-2xl">
          <div
            className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 transition-all duration-700 ${
              isAiThinking
                ? "animate-pulse scale-125 blur-sm"
                : "scale-100 shadow-[0_0_40px_rgba(37,99,235,0.4)]"
            }`}
          ></div>

          <div className="absolute bottom-6 left-6 right-6 bg-black/70 p-5 rounded-2xl backdrop-blur-lg border border-white/10">
            <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-2">
              AI Interviewer
            </p>
            <p className="text-xl font-medium leading-relaxed">
              {isAiThinking ? "Generating follow-up..." : `"${aiQuestion}"`}
            </p>
          </div>
        </div>

        {/* Box 2: User Profile (Webcam) */}
        <div className="flex-1 rounded-2xl border-2 border-emerald-500/30 bg-gray-900 relative overflow-hidden shadow-2xl">
          <Webcam className="h-full w-full object-cover" mirrored={true} />
          <div className="absolute bottom-6 left-6 right-6 bg-black/70 p-5 rounded-2xl backdrop-blur-lg border border-white/10">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-2">
              Candidate Feed
            </p>
            <p className="text-sm text-gray-300 italic">
              {transcript || "Waiting for your response..."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className="w-64 bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-500"
            style={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
          Progress: {questionCount} / {MAX_QUESTIONS} Questions
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex justify-center items-center gap-6">
        <button
          onClick={startListening}
          disabled={isAiThinking}
          className={`px-10 py-4 rounded-full font-bold transition-all transform active:scale-95 flex items-center gap-3 ${
            isAiThinking
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40"
          }`}
        >
          <span className="text-xl">🎤</span>
          {isAiThinking ? "Agent is Processing..." : "Speak Answer"}
        </button>
      </div>
    </div>
  );
};

export default InterviewPage;
