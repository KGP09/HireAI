import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Loader2,
  Video,
  MessageSquare,
  Shield,
  Activity,
  Timer,
  BrainCircuit,
} from "lucide-react";

const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const [transcript, setTranscript] = useState("");
  const [aiQuestion, setAiQuestion] = useState(
    "Configure your mock interview and click Start Interview to begin.",
  );
  const [questionCount, setQuestionCount] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const [jobRole, setJobRole] = useState(
    location.state?.jobRole || "Full-Stack Engineer",
  );
  const [seniority, setSeniority] = useState("Mid");
  const [focusArea, setFocusArea] = useState("Balanced");
  const [interviewerStyle, setInterviewerStyle] = useState("Challenging");
  const [questionStyle, setQuestionStyle] = useState("Scenario-led");
  const [targetLength, setTargetLength] = useState("Standard");

  const isSetupLocked =
    sessionStarted || isAiThinking || isStartingSession || isFinished;
  const progressByLength = {
    Short: 4,
    Standard: 7,
    Deep: 10,
  };
  const expectedResponses = progressByLength[targetLength] || 7;
  const progressPercent = Math.min(
    100,
    Math.round((questionCount / expectedResponses) * 100),
  );

  useEffect(() => {
    const chatEnd = document.getElementById("chat-end");
    if (chatEnd) {
      chatEnd.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!sessionStarted || isFinished) {
      return;
    }

    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStarted, isFinished]);

  const buildInterviewConfig = () => {
    const safeRole = jobRole.trim() || "Software Engineer";
    return {
      jobRole: safeRole,
      seniority,
      focusArea,
      interviewerStyle,
      questionStyle,
      targetLength,
    };
  };

  const buildJobDescription = (config) =>
    `${config.jobRole} (${config.seniority}) - ${config.focusArea} focus, ${config.questionStyle.toLowerCase()} questions, ${config.interviewerStyle.toLowerCase()} tone`;

  const speakText = (text) => {
    if (!text) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const generateFinalFeedback = async (finalHistory) => {
    const config = buildInterviewConfig();
    const jobDescription = buildJobDescription(config);
    setIsAnalyzing(true);
    try {
      const res = await axiosInstance.post("/user/generate-feedback", {
        transcript: finalHistory,
        jobDescription,
      });

      const report = res.data;

      try {
        await axiosInstance.post("/user/save-history", {
          transcript: finalHistory,
          feedback: report,
          jobDescription,
        });
      } catch (saveError) {
        console.error("History save failed:", saveError);
      }

      navigate("/results", { state: { report } });
    } catch (error) {
      alert("Post-processing failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startInterviewSession = async () => {
    if (sessionStarted || isStartingSession || isAiThinking) {
      return;
    }

    const config = buildInterviewConfig();
    if (!config.jobRole.trim()) {
      setAiQuestion("Please set a role before starting the interview.");
      return;
    }

    window.speechSynthesis.cancel();
    setIsStartingSession(true);
    setIsAiThinking(true);
    setIsFinished(false);
    setQuestionCount(0);
    setSessionSeconds(0);
    setTranscript("");
    setChatHistory([]);

    try {
      const res = await axiosInstance.post("/ai/interview", {
        isInitialPrompt: true,
        jobDescription: buildJobDescription(config),
        history: [],
        preferences: config,
      });

      const { question, isFinished: endSignal } = res.data;
      const openingQuestion =
        question || "Let us begin. Tell me about your most recent project.";

      const openingMessage = { role: "assistant", content: openingQuestion };

      setChatHistory([openingMessage]);
      setAiQuestion(openingQuestion);
      setSessionStarted(true);
      speakText(openingQuestion);

      if (endSignal) {
        setIsFinished(true);
        setTimeout(() => generateFinalFeedback([openingMessage]), 1200);
      }
    } catch (error) {
      setAiQuestion("Inference Error: Ensure Ollama local node is active.");
      setSessionStarted(false);
    } finally {
      setIsAiThinking(false);
      setIsStartingSession(false);
    }
  };

  const handleSendMessage = async (userText) => {
    window.speechSynthesis.cancel();

    if (!sessionStarted || isFinished || isAiThinking) {
      return;
    }

    const cleanUserText = (userText || "").trim();
    if (!cleanUserText) {
      return;
    }

    setIsAiThinking(true);
    setTranscript(cleanUserText);

    const userMessage = { role: "user", content: cleanUserText };
    const updatedHistoryForApi = [...chatHistory, userMessage];
    const config = buildInterviewConfig();

    try {
      const res = await axiosInstance.post("/ai/interview", {
        userResponse: cleanUserText,
        jobDescription: buildJobDescription(config),
        history: updatedHistoryForApi,
        preferences: config,
      });

      const { question, isFinished: endSignal, turnCount } = res.data;
      const nextQuestion = question || "Could you expand on that further?";
      const aiMessage = { role: "assistant", content: nextQuestion };

      setChatHistory((prev) => [...prev, userMessage, aiMessage]);
      setAiQuestion(nextQuestion);

      if (typeof turnCount === "number") {
        setQuestionCount(turnCount);
      } else {
        setQuestionCount((prev) => prev + 1);
      }

      speakText(nextQuestion);

      if (endSignal) {
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

  const startRecording = () => {
    if (!sessionStarted || isFinished || isAiThinking) {
      return;
    }

    window.speechSynthesis.cancel();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAiQuestion("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const spokenText = event?.results?.[0]?.[0]?.transcript;
      handleSendMessage(spokenText);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="h-screen bg-[#05070a] text-slate-200 font-sans p-6 overflow-hidden flex flex-col gap-6 relative">
      <div className="pointer-events-none absolute -top-24 -left-28 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
      >
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

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 lg:items-end">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="text-xs text-slate-400 col-span-2 md:col-span-1">
              <p className="uppercase text-[10px] font-bold mb-1">Role</p>
              <input
                list="role-suggestions"
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono w-full disabled:opacity-60"
                value={jobRole}
                disabled={isSetupLocked}
                onChange={(event) => setJobRole(event.target.value)}
                placeholder="Choose or type role"
              />
              <datalist id="role-suggestions">
                <option value="Frontend Engineer" />
                <option value="Backend Engineer" />
                <option value="Full-Stack Engineer" />
                <option value="Data Scientist" />
                <option value="Product Manager" />
                <option value="DevOps Engineer" />
              </datalist>
            </div>

            <div className="text-xs text-slate-400">
              <p className="uppercase text-[10px] font-bold mb-1">Seniority</p>
              <select
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono w-full disabled:opacity-60"
                value={seniority}
                disabled={isSetupLocked}
                onChange={(event) => setSeniority(event.target.value)}
              >
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              <p className="uppercase text-[10px] font-bold mb-1">Focus</p>
              <select
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono w-full disabled:opacity-60"
                value={focusArea}
                disabled={isSetupLocked}
                onChange={(event) => setFocusArea(event.target.value)}
              >
                <option>Balanced</option>
                <option>System Design</option>
                <option>Algorithms</option>
                <option>Behavioral</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              <p className="uppercase text-[10px] font-bold mb-1">Tone</p>
              <select
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono w-full disabled:opacity-60"
                value={interviewerStyle}
                disabled={isSetupLocked}
                onChange={(event) => setInterviewerStyle(event.target.value)}
              >
                <option>Supportive</option>
                <option>Challenging</option>
                <option>Strict</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              <p className="uppercase text-[10px] font-bold mb-1">
                Question Mode
              </p>
              <select
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono w-full disabled:opacity-60"
                value={questionStyle}
                disabled={isSetupLocked}
                onChange={(event) => setQuestionStyle(event.target.value)}
              >
                <option>Scenario-led</option>
                <option>Rapid-fire</option>
                <option>Deep-dive</option>
                <option>Mixed</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              <p className="uppercase text-[10px] font-bold mb-1">
                Target Length
              </p>
              <select
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono w-full disabled:opacity-60"
                value={targetLength}
                disabled={isSetupLocked}
                onChange={(event) => setTargetLength(event.target.value)}
              >
                <option>Short</option>
                <option>Standard</option>
                <option>Deep</option>
              </select>
            </div>
          </div>

          <div className="text-center min-w-28">
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Progress
            </p>
            {!sessionStarted ? (
              <p className="text-xs text-slate-300 font-mono">Not started</p>
            ) : isFinished ? (
              <p className="text-xs text-emerald-400 font-mono">Completed</p>
            ) : (
              <p className="text-xs text-emerald-400 font-mono">
                {questionCount} responses
              </p>
            )}
          </div>

          <div className="text-center min-w-28">
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Duration
            </p>
            <p className="text-xs text-cyan-300 font-mono flex items-center justify-center gap-1">
              <Timer className="w-3 h-3" />
              {formatTime(sessionSeconds)}
            </p>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <motion.div whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase text-slate-500 font-bold">Mode</p>
          <p className="text-sm text-blue-300 font-semibold">{questionStyle}</p>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase text-slate-500 font-bold">Focus</p>
          <p className="text-sm text-emerald-300 font-semibold">{focusArea}</p>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase text-slate-500 font-bold">
            Interviewer
          </p>
          <p className="text-sm text-indigo-300 font-semibold">
            {interviewerStyle}
          </p>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase text-slate-500 font-bold">
            Coverage
          </p>
          <p className="text-sm text-white font-semibold">{progressPercent}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </motion.div>
      </motion.div>

      <main className="flex flex-[3] gap-6 min-h-0">
        <motion.section
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex-1 relative group bg-gradient-to-b from-slate-900 to-black rounded-3xl border border-white/10 overflow-hidden shadow-inner"
        >
          <div className="absolute inset-0 flex items-center justify-center">
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

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-[10px] uppercase px-2 py-1 rounded-full border border-white/15 bg-black/40 text-slate-300">
              {isAiThinking ? "Thinking" : "Ready"}
            </span>
            <span className="text-[10px] uppercase px-2 py-1 rounded-full border border-indigo-400/30 bg-indigo-500/15 text-indigo-200 flex items-center gap-1">
              <BrainCircuit className="w-3 h-3" />
              AI Live
            </span>
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
                  next question...
                </span>
              ) : (
                aiQuestion
              )}
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 relative rounded-3xl border border-white/10 overflow-hidden bg-slate-900"
        >
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
              {!sessionStarted
                ? "Session not started. Configure settings and click Start Interview."
                : isRecording
                  ? transcript || "Listening to audio input..."
                  : isFinished
                    ? "Interview complete. Preparing evaluation report..."
                    : "Standby - waiting for your next response."}
            </p>
          </div>
        </motion.section>
      </main>

      <footer className="flex flex-[1.2] gap-6 min-h-0">
        <div className="flex-[2] bg-white/5 border border-white/10 rounded-3xl p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <div className="flex flex-col gap-3">
            {chatHistory.map((msg, index) => (
              <motion.div
                key={`${msg.role}-${index}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-xl text-xs ${msg.role === "user" ? "bg-blue-600/20 border border-blue-500/30" : "bg-white/5 border border-white/10 text-slate-400"}`}
                >
                  {msg.content}
                </div>
              </motion.div>
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
          ) : !sessionStarted ? (
            <button
              onClick={startInterviewSession}
              disabled={isStartingSession || isAiThinking || !jobRole.trim()}
              className="group flex flex-col items-center gap-2 transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
            >
              <div className="p-6 rounded-full border-4 bg-white text-blue-600 border-blue-400">
                {isStartingSession ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  <Activity size={32} />
                )}
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-center px-2">
                {isStartingSession ? "Starting Session" : "Start Interview"}
              </span>
            </button>
          ) : isFinished ? (
            <div className="text-center px-6">
              <p className="text-sm font-bold uppercase tracking-[0.15em]">
                Session Complete
              </p>
              <p className="text-xs text-blue-100 mt-1">
                Final feedback is being prepared.
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
              <span className="text-xs font-black uppercase tracking-[0.2em] text-center px-2">
                {isRecording ? "Listening" : "Capture Response"}
              </span>
              <span className="text-[10px] text-blue-100/80">
                Tip: keep answers under 60 seconds
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default InterviewPage;
