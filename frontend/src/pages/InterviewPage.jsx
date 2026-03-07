import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mic,
  MicOff,
  Loader2,
  Video,
  MessageSquare,
  Shield,
  Activity,
} from "lucide-react";

const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const MAX_QUESTIONS = 5;
  const selectedJob = location.state?.jobRole || "Technical Candidate";

  const [transcript, setTranscript] = useState("");
  const [aiQuestion, setAiQuestion] = useState(
    "System initialized. Click 'Initiate Session' to begin the interview.",
  );
  const [questionCount, setQuestionCount] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const chatEnd = document.getElementById("chat-end");
    if (chatEnd) chatEnd.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async (userText) => {
    window.speechSynthesis.cancel();
    if (isFinished || isAiThinking) return;

    setIsAiThinking(true);
    setTranscript(userText);
    const userMessage = { role: "user", content: userText };
    const updatedHistoryForApi = [...chatHistory, userMessage];

    try {
      const res = await axiosInstance.post("/ai/interview", {
        userResponse: userText,
        jobDescription: selectedJob,
        history: updatedHistoryForApi,
      });

      const { question, isFinished: endSignal } = res.data;
      const aiMessage = { role: "assistant", content: question };
      const nextCount = questionCount + 1;

      setChatHistory((prev) => [...prev, userMessage, aiMessage]);
      setAiQuestion(question);
      setQuestionCount(nextCount);

      const utterance = new SpeechSynthesisUtterance(question);
      window.speechSynthesis.speak(utterance);

      if (endSignal || nextCount >= MAX_QUESTIONS) {
        setIsFinished(true);
        setTimeout(
          () => generateFinalFeedback([...updatedHistoryForApi, aiMessage]),
          1500,
        );
      }
    } catch (error) {
      setAiQuestion("Inference Error: Ensure Ollama local node is active.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const generateFinalFeedback = async (finalHistory) => {
    setIsAnalyzing(true);
    try {
      const res = await axiosInstance.post("/user/generate-feedback", {
        transcript: finalHistory,
        jobDescription: selectedJob,
      });
      navigate("/results", { state: { report: res.data } });
    } catch (error) {
      alert("Post-processing failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = () => {
    window.speechSynthesis.cancel();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) =>
      handleSendMessage(event.results[0][0].transcript);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  return (
    <div className="h-screen bg-[#05070a] text-slate-200 font-sans p-6 overflow-hidden flex flex-col gap-6">
      {/* HEADER BAR */}
      <header className="flex justify-between items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase">
              AI Interview Protocol
            </h1>
            <p className="text-[10px] text-slate-500 font-mono italic">
              ID: {authUser?._id?.slice(-8) || "GUEST"}
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Target Role
            </p>
            <p className="text-xs text-blue-400 font-mono">{selectedJob}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Progress
            </p>
            <p className="text-xs text-emerald-400 font-mono">
              {questionCount}/{MAX_QUESTIONS}
            </p>
          </div>
        </div>
      </header>

      {/* MAIN VISUAL STAGE */}
      <main className="flex flex-[3] gap-6 min-h-0">
        {/* AI NODE VIEW */}
        <section className="flex-1 relative group bg-gradient-to-b from-slate-900 to-black rounded-3xl border border-white/10 overflow-hidden shadow-inner">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Pulsing Core */}
            <div
              className={`absolute w-64 h-64 rounded-full bg-blue-500/5 transition-all duration-1000 ${isAiThinking ? "scale-150 opacity-20" : "scale-100 opacity-10"}`}
            />
            <div
              className={`w-32 h-32 rounded-full border-2 border-blue-500/50 flex items-center justify-center transition-all duration-500 ${isAiThinking ? "rotate-180 shadow-[0_0_50px_rgba(59,130,246,0.5)]" : ""}`}
            >
              <Activity
                className={`w-12 h-12 text-blue-400 ${isAiThinking ? "animate-pulse" : ""}`}
              />
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                System Output
              </span>
            </div>
            <p className="text-lg font-light leading-relaxed text-slate-100">
              {isAiThinking ? (
                <span className="flex items-center gap-2 italic text-slate-400">
                  <Loader2 className="animate-spin w-4 h-4" /> Synthesizing
                  evaluation...
                </span>
              ) : (
                aiQuestion
              )}
            </p>
          </div>
        </section>

        {/* CANDIDATE VIEW */}
        <section className="flex-1 relative rounded-3xl border border-white/10 overflow-hidden bg-slate-900">
          <Webcam className="h-full w-full object-cover" mirrored={true} />
          <div className="absolute top-6 left-6 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
            <Video className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Live Feed
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 p-6 bg-emerald-950/40 backdrop-blur-xl border border-emerald-500/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                Speech Capture
              </span>
            </div>
            <p className="text-sm text-slate-200 italic line-clamp-2">
              {isRecording
                ? transcript || "Listening to audio input..."
                : "Standby - Waiting for trigger..."}
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER: CHAT & CONTROLS */}
      <footer className="flex flex-[1.2] gap-6 min-h-0">
        <div className="flex-[2] bg-white/5 border border-white/10 rounded-3xl p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <div className="flex flex-col gap-3">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-xl text-xs ${msg.role === "user" ? "bg-blue-600/20 border border-blue-500/30" : "bg-white/5 border border-white/10 text-slate-400"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div id="chat-end" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center gap-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg shadow-blue-900/20">
          {isAnalyzing ? (
            <div className="text-center">
              <Loader2 className="animate-spin w-10 h-10 mx-auto mb-2 text-white" />
              <p className="text-[10px] font-black uppercase tracking-tighter">
                Analyzing Competency
              </p>
            </div>
          ) : (
            <button
              onClick={startRecording}
              disabled={isAiThinking || isRecording}
              className={`group flex flex-col items-center gap-2 transition-all ${isRecording ? "opacity-100 scale-110" : "hover:scale-105"}`}
            >
              <div
                className={`p-6 rounded-full border-4 ${isRecording ? "bg-red-500 border-white/40 animate-pulse" : "bg-white text-blue-600 border-blue-400"}`}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em]">
                {isRecording ? "Stop Capture" : "Initiate Session"}
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default InterviewPage;
