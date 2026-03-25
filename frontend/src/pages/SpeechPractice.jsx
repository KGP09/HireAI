import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Loader2,
  Brain,
  Sparkles,
  Layers,
  Gauge,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useSpeechPracticeStore } from "../store/useSpeechPracticeStore";

const categories = [
  "Behavioral",
  "Technical Explanation",
  "Product Thinking",
  "Debate",
  "Random",
];

const difficulties = ["Easy", "Medium", "Hard"];

const prepDuration = 15; // seconds
const speakingDuration = 60; // seconds

export default function SpeechPractice() {
  const {
    generateTopic,
    analyzeResponse,
    isGeneratingTopic,
    isAnalyzing,
    currentTopic,
  } = useSpeechPracticeStore();

  const [selectedCategory, setSelectedCategory] = useState("Random");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [phase, setPhase] = useState("idle"); // idle | preparing | speaking | review
  const [prepTimeLeft, setPrepTimeLeft] = useState(prepDuration);
  const [speakTimeLeft, setSpeakTimeLeft] = useState(speakingDuration);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const recognitionRef = useRef(null);
  const startedAtRef = useRef(null);

  const activeTopic = currentTopic?.topic || "";
  const activeCategory = currentTopic?.category || selectedCategory;

  const wordCount = transcript
    ? transcript.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGenerateTopic = async () => {
    try {
      setFeedback(null);
      setTranscript("");
      setPhase("idle");
      await generateTopic({
        category: selectedCategory,
        difficulty: selectedDifficulty,
      });
      setPrepTimeLeft(prepDuration);
      setSpeakTimeLeft(speakingDuration);
      setPhase("preparing");
    } catch {
      // Errors surfaced via toast
    }
  };

  // Preparation countdown
  useEffect(() => {
    if (phase !== "preparing") return;
    if (prepTimeLeft <= 0) {
      setPhase("speaking");
      setSpeakTimeLeft(speakingDuration);
      return;
    }

    const interval = setInterval(() => {
      setPrepTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, prepTimeLeft]);

  // Speaking countdown (starts when recognition is active)
  useEffect(() => {
    if (phase !== "speaking" || !isRecognizing) return;
    if (speakTimeLeft <= 0) {
      stopRecognition(true);
      return;
    }

    const interval = setInterval(() => {
      setSpeakTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, speakTimeLeft, isRecognizing]);

  // Initialize SpeechRecognition only in browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript + " ";
      }
      setTranscript(combined.trim());
    };

    recognition.onstart = () => {
      setIsRecognizing(true);
      startedAtRef.current = Date.now();
    };

    recognition.onerror = () => {
      setIsRecognizing(false);
    };

    recognition.onend = () => {
      setIsRecognizing(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop?.();
    };
  }, []);

  const startRecognition = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser. Try using the latest version of Chrome or Edge."
      );
      return;
    }
    if (isRecognizing) return;
    setTranscript("");
    recognitionRef.current.start();
  };

  const stopRecognition = (auto = false) => {
    if (!recognitionRef.current || !isRecognizing) {
      if (auto && phase === "speaking") {
        finalizeResponse();
      }
      return;
    }

    recognitionRef.current.stop();
    finalizeResponse();
  };

  const finalizeResponse = async () => {
    if (!activeTopic || !transcript) {
      setPhase("review");
      return;
    }

    setPhase("review");
    try {
      const elapsedSeconds =
        startedAtRef.current != null
          ? Math.round((Date.now() - startedAtRef.current) / 1000)
          : speakingDuration - speakTimeLeft;

      const result = await analyzeResponse({
        topic: activeTopic,
        transcript,
        category: activeCategory,
        duration: elapsedSeconds,
      });
      setFeedback(result);
    } catch {
      // handled via toast
    }
  };

  const scores = feedback?.scores || {
    clarity: 0,
    structure: 0,
    confidence: 0,
    conciseness: 0,
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 flex items-center justify-center px-4 py-10">
      {/* Background mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-blue-400 mb-2">
              Mode // Speech Practice
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Impromptu Communication Lab
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Generate interview-style prompts, think for 15 seconds, then
              speak for 60 seconds while the AI evaluates clarity, structure,
              and confidence.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Prep {prepDuration}s</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-1">
              <Mic className="w-4 h-4" />
              <span>Speak {speakingDuration}s</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
          {/* Left: Topic, timers, recorder */}
          <div className="space-y-6">
            {/* Topic controls */}
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateTopic}
                disabled={isGeneratingTopic}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGeneratingTopic ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Topic
                  </>
                )}
              </button>
            </div>

            {/* Topic card */}
            <AnimatePresence>
              {activeTopic && (
                <motion.div
                  key={activeTopic}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 shadow-2xl"
                >
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                  <div className="relative flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
                      <Brain className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                        <span>{activeCategory}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                        <span>{selectedDifficulty} prompt</span>
                      </div>
                      <p className="text-lg md:text-xl text-slate-50 leading-relaxed">
                        {activeTopic}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timers + mic */}
            <div className="space-y-4">
              {/* Timers HUD */}
              <div className="flex flex-wrap gap-3">
                <motion.div
                  animate={{
                    scale: phase === "preparing" ? [1, 1.04, 1] : 1,
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: phase === "preparing" ? Infinity : 0,
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-mono ${
                    phase === "preparing"
                      ? "border-amber-400/60 bg-amber-500/10 text-amber-100"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="uppercase tracking-[0.18em]">
                    Prep: {formatTime(prepTimeLeft)}
                  </span>
                </motion.div>

                <motion.div
                  animate={{
                    scale:
                      phase === "speaking" && isRecognizing
                        ? [1, 1.06, 1]
                        : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: phase === "speaking" && isRecognizing ? Infinity : 0,
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-mono ${
                    phase === "speaking"
                      ? "border-red-400/60 bg-red-500/10 text-red-100"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="uppercase tracking-[0.18em]">
                    Speak: {formatTime(speakTimeLeft)}
                  </span>
                </motion.div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-xs font-mono text-slate-300">
                  <MessageCircle className="w-4 h-4" />
                  <span className="uppercase tracking-[0.18em]">
                    Words: {wordCount}
                  </span>
                </div>
              </div>

              {/* Mic control */}
              <div className="flex flex-col items-center gap-4 pt-2">
                <button
                  disabled={!activeTopic || isAnalyzing}
                  onClick={() => {
                    if (phase === "preparing") {
                      setPhase("speaking");
                      setSpeakTimeLeft(speakingDuration);
                      startRecognition();
                      return;
                    }
                    if (phase === "speaking" && isRecognizing) {
                      stopRecognition(false);
                      return;
                    }
                    if (phase === "speaking" && !isRecognizing) {
                      startRecognition();
                    }
                  }}
                  className={`group relative inline-flex items-center justify-center w-28 h-28 rounded-full transition-all ${
                    !activeTopic || isAnalyzing
                      ? "bg-slate-700/70 cursor-not-allowed opacity-60"
                      : isRecognizing
                      ? "bg-red-600 shadow-[0_0_80px_rgba(248,113,113,0.45)]"
                      : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_60px_rgba(59,130,246,0.35)]"
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-full border ${
                      isRecognizing
                        ? "border-red-300/70 animate-ping"
                        : "border-blue-300/40"
                    }`}
                  />
                  {isAnalyzing ? (
                    <Loader2 className="w-9 h-9 text-white animate-spin" />
                  ) : (
                    <Mic
                      className={`w-10 h-10 text-white ${
                        isRecognizing ? "scale-110" : ""
                      }`}
                    />
                  )}
                </button>
                <p className="text-[11px] uppercase tracking-[0.18em] font-mono text-slate-500">
                  {phase === "idle" && "Generate a topic to begin"}
                  {phase === "preparing" && "Prep time — think in outlines, not scripts"}
                  {phase === "speaking" && !isRecognizing && "Tap to start speaking"}
                  {phase === "speaking" && isRecognizing && "Tap to end response"}
                  {phase === "review" && "Response captured — see analysis below"}
                </p>
              </div>

              {/* Live transcript */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Live transcript
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Auto-saved locally — never shared until you submit
                  </span>
                </div>
                <div className="min-h-[120px] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-200 overflow-y-auto max-h-48">
                  {transcript || (
                    <span className="text-slate-600 italic">
                      Your words will appear here as you speak.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Feedback */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                  Neural Review
                </p>
                <h2 className="text-lg font-semibold text-white mt-1">
                  AI feedback on your delivery
                </h2>
              </div>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Score cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <ScoreCard
                      label="Clarity"
                      value={scores.clarity}
                      icon={Sparkles}
                      tone="blue"
                    />
                    <ScoreCard
                      label="Structure"
                      value={scores.structure}
                      icon={Layers}
                      tone="purple"
                    />
                    <ScoreCard
                      label="Confidence"
                      value={scores.confidence}
                      icon={Gauge}
                      tone="emerald"
                    />
                    <ScoreCard
                      label="Conciseness"
                      value={scores.conciseness}
                      icon={Clock}
                      tone="amber"
                    />
                  </div>

                  {/* Filler words */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400 font-semibold flex items-center gap-2">
                      <Mic className="w-3 h-3" />
                      Filler words detected
                    </p>
                    {feedback.fillerWords?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {feedback.fillerWords.map((fw, idx) => (
                          <span
                            key={`${fw.word}-${idx}`}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-100"
                          >
                            <span className="font-mono">{fw.word}</span>
                            <span className="text-amber-300/80 text-[10px]">
                              ×{fw.count}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-300">
                        No clear filler words detected — strong signal.
                      </p>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400 font-semibold">
                      Improvement suggestions
                    </p>
                    {feedback.improvementSuggestions?.length ? (
                      <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                        {feedback.improvementSuggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Complete a response to see targeted coaching.
                      </p>
                    )}
                  </div>

                  {/* Strengths */}
                  {feedback.strengths?.length > 0 && (
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 space-y-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-emerald-300 font-semibold">
                        Strengths observed
                      </p>
                      <ul className="list-disc list-inside text-xs text-emerald-100 space-y-1">
                        {feedback.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!feedback && (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/40 p-4 text-xs text-slate-500">
                Deliver a full 60-second response to unlock AI feedback on your
                speaking style, filler words, and narrative structure.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, icon: Icon, tone }) {
  const toneClasses = {
    blue: {
      border: "border-blue-400/40",
      bg: "bg-blue-500/10",
      icon: "text-blue-300",
    },
    purple: {
      border: "border-purple-400/40",
      bg: "bg-purple-500/10",
      icon: "text-purple-300",
    },
    emerald: {
      border: "border-emerald-400/40",
      bg: "bg-emerald-500/10",
      icon: "text-emerald-300",
    },
    amber: {
      border: "border-amber-400/40",
      bg: "bg-amber-500/10",
      icon: "text-amber-300",
    },
  }[tone || "blue"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border ${toneClasses.border} ${toneClasses.bg} p-3 flex items-center justify-between`}
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300 font-semibold">
          {label}
        </p>
        <p className="text-2xl font-mono font-bold text-white mt-1">{value}</p>
      </div>
      <div className="p-2 rounded-xl bg-black/20">
        <Icon className={`w-5 h-5 ${toneClasses.icon}`} />
      </div>
    </motion.div>
  );
}

