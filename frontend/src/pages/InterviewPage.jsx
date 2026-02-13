import React, { useState, useRef } from "react"; // Added useRef here
import Webcam from "react-webcam";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const InterviewPage = () => {
  const [transcript, setTranscript] = useState("");
  const [aiQuestion, setAiQuestion] = useState(
    "Hello! I am your AI interviewer. Click 'Speak Answer' to begin.",
  ); // Added state
  const [questionCount, setQuestionCount] = useState(0);
  // const MAX_QUESTIONS = 5; // Change this to whatever limit you want
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { authUser } = useAuthStore();
  const MAX_QUESTIONS = 5;
  const selectedJob = "React Developer";

  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const chatEnd = document.getElementById("chat-end");
    if (chatEnd) {
      chatEnd.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);
  // const startListening = () => {
  //   if (recognitionRef.current) return;

  //   const SpeechRecognition =
  //     window.SpeechRecognition || window.webkitSpeechRecognition;
  //   if (!SpeechRecognition) {
  //     alert("Browser not supported. Use Chrome.");
  //     return;
  //   }

  //   const recognition = new SpeechRecognition();
  //   recognition.lang = "en-US";
  //   recognition.continuous = false;
  //   recognition.interimResults = false;

  //   recognitionRef.current = recognition;

  //   recognition.onstart = () => {
  //     setTranscript("Listening...");
  //   };

  //   recognition.onresult = async (event) => {
  //     const userText = event.results[0][0].transcript;
  //     setTranscript(userText);
  //     // We call the backend directly here
  //     await sendToBackend(userText);
  //   };

  //   recognition.onerror = (event) => {
  //     console.error("Speech Error:", event.error);
  //     recognitionRef.current = null;
  //   };

  //   recognition.onend = () => {
  //     recognitionRef.current = null;
  //   };

  //   recognition.start();
  // };

  // const sendToBackend = async (text) => {
  //   // 1. Check if we should end the interview
  //   const updatedHistory = [...chatHistory, { role: "user", content: text }];

  //   // Update the transcript state immediately for UI feedback
  //   setChatHistory(updatedHistory);

  //   if (questionCount + 1 >= MAX_QUESTIONS) {
  //     setIsFinished(true);
  //     const endMessage =
  //       "Thank you. I have enough information. Generating your report now...";
  //     setAiQuestion(endMessage);

  //     // Speak the end message
  //     const utterance = new SpeechSynthesisUtterance(endMessage);
  //     window.speechSynthesis.speak(utterance);

  //     // CRITICAL: Send the FULL history (including the last answer) to analysis
  //     await handleFinishInterview(updatedHistory);
  //     return;
  //   }

  //   setIsAiThinking(true);
  //   try {
  //     // Pass the count to the backend so the AI knows we are near the end
  //     const response = await axiosInstance.post("/ai/interview", {
  //       userResponse: text,
  //       jobDescription: "React Developer",
  //       currentRound: questionCount + 1,
  //       history: updatedHistory,
  //     });

  //     const nextQuestion = response.data.question;
  //     setChatHistory([
  //       ...updatedHistory,
  //       { role: "assistant", content: nextQuestion },
  //     ]);
  //     setAiQuestion(nextQuestion);

  //     // Update the counter
  //     setQuestionCount((prev) => prev + 1);

  //     const utterance = new SpeechSynthesisUtterance(nextQuestion);
  //     window.speechSynthesis.speak(utterance);
  //   } catch (error) {
  //     console.error("Interview Error:", error);
  //     setAiQuestion("Sorry, I encountered an error. Is Ollama running?");
  //   } finally {
  //     setIsAiThinking(false);
  //   }
  // };
  // 1. Fix the constants at the top
  // Define this or use it from props

  const handleSendMessage = async (userText) => {
    window.speechSynthesis.cancel();
    if (isFinished || isAiThinking) return;
    setIsAiThinking(true);

    const userMessage = { role: "user", content: userText };
    const updatedHistoryForApi = [...chatHistory, userMessage];

    try {
      const res = await axiosInstance.post(
        "http://localhost:5004/api/ai/interview",
        {
          userResponse: userText,
          jobDescription: selectedJob,
          history: updatedHistoryForApi,
        },
      );

      const { question, isFinished: endSignal } = res.data;
      const aiMessage = { role: "assistant", content: question };

      // 1. Calculate the NEW count locally
      const nextCount = questionCount + 1;

      // 2. Update states
      setChatHistory((prev) => [...prev, userMessage, aiMessage]);
      setAiQuestion(question);
      setQuestionCount(nextCount); // Use the variable

      const utterance = new SpeechSynthesisUtterance(question);
      window.speechSynthesis.speak(utterance);

      // 3. Use the local 'nextCount' for the comparison
      if (endSignal || nextCount >= MAX_QUESTIONS) {
        setIsFinished(true);
        // Ensure we pass the absolute final state to feedback
        const finalHistory = [...updatedHistoryForApi, aiMessage];
        await generateFinalFeedback(finalHistory);
      }
    } catch (error) {
      console.error("Interview Error:", error);
      setAiQuestion("Connection lost. Is Ollama running?");
    } finally {
      setIsAiThinking(false);
    }
  };
  const generateFinalFeedback = async (finalHistory) => {
    setIsAnalyzing(true);
    try {
      // 1. Get the Feedback from AI
      // Note: We use the transcript and jobDescription to get the score/strengths
      const res = await axiosInstance.post("/user/generate-feedback", {
        transcript: finalHistory,
        jobDescription: selectedJob,
      });

      const report = res.data;

      // 2. Safety Check: Ensure report has data before saving
      if (report) {
        await axiosInstance.post("/user/save-history", {
          transcript: finalHistory,
          feedback: report, // This now includes the 'score' as a Number
          jobDescription: selectedJob,
        });

        // 3. Navigate to results page with the report data
        // We pass it in 'state' so the results page can display it immediately
        navigate("/results", { state: { report } });
      }
    } catch (error) {
      console.error("Process failed:", error);
      alert("Analysis failed. Please check your connection to Ollama.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleFinishInterview = async (finalHistory) => {
    setIsAiThinking(true);
    try {
      // 1. Try to get ID from multiple potential sources
      const id = localStorage.getItem("userId") || authUser?._id;
      const email = localStorage.getItem("userEmail") || authUser?.mail;

      if (!id) {
        console.error("Critical: No User ID found. Backend will reject this.");
        // Fallback for demo: use a hardcoded valid MongoDB ID if you're in a pinch
      }

      const response = await axiosInstance.post("/ai/analyze", {
        chatHistory: finalHistory,
        jobDescription: "React Developer",
        id: id,
        email: email, // Good for the History record
      });

      setReport(response.data);
      setAiQuestion("Analysis complete!");
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAiThinking(false);
    }
  };

  const startRecording = () => {
    // Check if browser supports Speech Recognition
    window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis to prevent overlap
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Your browser does not support speech recognition. Please use Chrome.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false; // Only get the final result

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("User said:", transcript);

      // Pass the transcript to your message handler
      handleSendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
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

      <div className="flex flex-col gap-4 h-[400px] overflow-y-auto p-4 bg-black/20 rounded-lg border border-white/5">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-gray-800 text-gray-200 rounded-tl-none border border-white/5"
              }`}
            >
              <p className="font-bold text-[10px] uppercase tracking-widest mb-1 opacity-50">
                {msg.role === "user" ? "You" : "AI Interviewer"}
              </p>
              {msg.content}
            </div>
          </div>
        ))}
        {isAiThinking && (
          <div className="text-xs text-gray-500 animate-pulse">
            AI is typing...
          </div>
        )}
        <div id="chat-end" />
      </div>

      {/* Live Status Badge */}
      <div className="flex flex-col items-center mb-8">
        <div
          className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-500 bg-gray-900/50 backdrop-blur-sm ${
            isFinished
              ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "border-white/10"
          }`}
        >
          {/* The Indicator Dot */}
          <div className="relative flex h-3 w-3">
            {/* Pulse effect for active states */}
            {(isAiThinking || isRecording || isAnalyzing) && (
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isRecording
                    ? "bg-red-500"
                    : isAnalyzing
                      ? "bg-emerald-500"
                      : "bg-blue-500"
                }`}
              ></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isRecording
                  ? "bg-red-500"
                  : isAnalyzing
                    ? "bg-emerald-500"
                    : isFinished
                      ? "bg-emerald-500"
                      : isAiThinking
                        ? "bg-blue-500"
                        : "bg-blue-500/50"
              }`}
            ></span>
          </div>

          {/* The Status Text */}
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">
            {isAnalyzing
              ? "Finalizing Report..."
              : isFinished
                ? "Interview Complete"
                : isRecording
                  ? "Listening..."
                  : isAiThinking
                    ? "Agent is Thinking"
                    : "Session Live"}
          </span>
        </div>

        {/* Sub-label for context */}
        <p className="mt-3 text-[9px] text-gray-500 uppercase tracking-widest font-medium">
          {isFinished
            ? "All data saved to history"
            : `Current Round: ${questionCount + 1}`}
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex justify-center items-center gap-6">
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p>Analyzing Performance...</p>
          </div>
        ) : isFinished ? (
          <p className="text-emerald-400 font-bold">Interview Finished!</p>
        ) : (
          <button
            onClick={startRecording}
            disabled={isAiThinking || isRecording}
            className={`px-10 py-4 rounded-full font-bold transition-all flex items-center gap-3 ${
              isRecording
                ? "bg-red-600 animate-pulse"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            <span className="text-xl">{isRecording ? "🛑" : "🎤"}</span>
            {isRecording
              ? "Listening..."
              : isAiThinking
                ? "AI is thinking..."
                : "Speak Answer"}
          </button>
        )}
      </div>
      {/* <div className="flex justify-center items-center gap-6">
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
      {isAnalyzing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
          <p className="text-white font-medium">
            AI is analyzing your performance...
          </p>
        </div>
      ) : isFinished ? (
        <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/50">
          <p className="text-green-400 text-center font-bold">
            Interview Complete! Redirecting to results...
          </p>
        </div>
      ) : (
        <button onClick={startRecording} className="...">
          {isRecording ? "Stop Recording" : "Push to Talk"}
        </button>
      )} */}
      {report && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-gray-900 border-2 border-blue-500 rounded-3xl p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(59,130,246,0.5)]">
            <h2 className="text-3xl font-bold mb-2 text-center">
              Interview Result
            </h2>
            <div className="flex justify-center mb-6">
              <div className="text-5xl font-black text-blue-500 bg-blue-500/10 px-6 py-3 rounded-2xl border border-blue-500/20">
                {report.overallScore}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                <p className="text-emerald-400 font-bold text-xs uppercase mb-2">
                  Strengths
                </p>
                <ul className="text-sm list-disc list-inside text-gray-300">
                  {report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                <p className="text-red-400 font-bold text-xs uppercase mb-2">
                  Weaknesses
                </p>
                <ul className="text-sm list-disc list-inside text-gray-300">
                  {report.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-gray-400 text-center italic mb-8">
              "{report.feedback}"
            </p>

            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
