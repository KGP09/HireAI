import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "../store/useAuthStore";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lightbulb, Timer, ArrowRight, X } from "lucide-react";

export default function Aptitude() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { index } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [typedFeedback, setTypedFeedback] = useState("");

  useEffect(() => {
    const loadQuestions = async () => {
      if (!authUser?._id) return;
      try {
        const res = await axiosInstance.post("/tests/get-tests", {
          id: authUser._id,
        });

        if (res.data.length > 0) {
          const sortedTests = [...res.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          const latestTest = sortedTests[0];
          const roundIdx = parseInt(index);
          const currentRound = latestTest.rounds[roundIdx];

          if (currentRound?.questions && Array.isArray(currentRound.questions)) {
            setQuestions(currentRound.questions);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [authUser?._id, index]);

  const q = questions[current];
  const totalQuestions = questions.length || 10;
  const userAnswer = answers[current] || "";
  const totalTime = 180;
  const timerProgress = Math.max(0, (timeLeft / totalTime) * 100);
  const timerUrgent = timeLeft <= 30;

  useEffect(() => {
    if (loading || !q || showFeedback) return;
    if (timeLeft <= 0) {
      setIsSubmitted(true);
      setShowFeedback(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, q, showFeedback, timeLeft]);

  useEffect(() => {
    setTimeLeft(180);
    setIsHintOpen(false);
    setShowFeedback(false);
    setIsSubmitted(false);
    setTypedFeedback("");
  }, [current]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (!showFeedback && !isSubmitted && String(userAnswer).trim()) {
          setIsSubmitted(true);
          setShowFeedback(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showFeedback, isSubmitted, userAnswer]);

  const normalizedDifficulty = useMemo(() => {
    const raw = String(q?.difficulty || "Medium").toLowerCase();
    if (raw.includes("easy")) return "Easy";
    if (raw.includes("hard")) return "Hard";
    return "Medium";
  }, [q?.difficulty]);

  const tags = useMemo(() => {
    if (Array.isArray(q?.tags) && q.tags.length) return q.tags.slice(0, 4);
    const fallback = [];
    const text = String(q?.question || "").toLowerCase();
    if (text.includes("array")) fallback.push("Arrays");
    if (text.includes("search")) fallback.push("Binary Search");
    if (text.includes("system")) fallback.push("System Design");
    if (text.includes("database")) fallback.push("DBMS");
    if (fallback.length === 0) fallback.push("Problem Solving", "Data Structures");
    return fallback.slice(0, 4);
  }, [q?.question, q?.tags]);

  const hintText = useMemo(() => {
    if (q?.hint) return q.hint;
    return "Start by stating assumptions, discuss tradeoffs, and walk through edge cases before finalizing your approach.";
  }, [q?.hint]);

  const feedbackData = useMemo(() => {
    const words = userAnswer.trim().split(/\s+/).filter(Boolean).length;
    const hasStructure = /first|second|finally|approach|step|tradeoff/i.test(userAnswer);
    const hasDepth = /complexity|scal|cache|latency|database|index|api|consistency/i.test(userAnswer);
    const hasAccuracy = userAnswer.length > 120;
    const clarity = Math.min(95, 45 + Math.floor(words * 1.2));
    const structure = hasStructure ? 86 : 62;
    const depth = hasDepth ? 88 : 64;
    const accuracy = hasAccuracy ? 84 : 60;
    const score = Math.round((clarity + structure + depth + accuracy) / 4);
    const summary =
      score >= 80
        ? "Strong answer overall. You explained your approach clearly and showed sound engineering judgment. Add one concrete failure-handling scenario to make it interview-ready."
        : "Solid baseline explanation. Improve by making your structure explicit, discussing tradeoffs, and including scalability or edge-case reasoning in your answer.";
    return {
      score,
      metrics: [
        { key: "Clarity", value: clarity },
        { key: "Structure", value: structure },
        { key: "Depth", value: depth },
        { key: "Accuracy", value: accuracy },
      ],
      summary,
    };
  }, [userAnswer]);

  useEffect(() => {
    if (!showFeedback) return;
    let idx = 0;
    const fullText = feedbackData.summary;
    const typer = setInterval(() => {
      idx += 1;
      setTypedFeedback(fullText.slice(0, idx));
      if (idx >= fullText.length) clearInterval(typer);
    }, 14);
    return () => clearInterval(typer);
  }, [showFeedback, feedbackData.summary]);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const submitCurrentAnswer = () => {
    if (!String(userAnswer).trim()) return;
    setIsSubmitted(true);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (current >= questions.length - 1) {
      navigate("/practice");
      return;
    }
    setCurrent((prev) => prev + 1);
  };

  const difficultyStyle =
    normalizedDifficulty === "Easy"
      ? "text-emerald-300 border-emerald-400/30 bg-emerald-500/10"
      : normalizedDifficulty === "Hard"
        ? "text-rose-300 border-rose-400/30 bg-rose-500/10"
        : "text-amber-300 border-amber-400/30 bg-amber-500/10";

  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0F] text-white">
        <Loader2 className="animate-spin text-indigo-400 w-12 h-12" />
        <p>Loading AI Questions...</p>
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="p-10 text-center min-h-screen bg-[#0A0A0F] text-white">
        <h2 className="text-xl font-bold">No Questions Found</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400"
        >
          Go to Dashboard
        </button>
      </div>
    );

  const ringCircumference = 2 * Math.PI * 26;
  const ringOffset = ringCircumference - (timerProgress / 100) * ringCircumference;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8FAFC] font-['DM_Sans'] p-4 md:p-6">
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-2 z-30 rounded-2xl border border-white/10 bg-[#111118]/90 backdrop-blur-xl px-4 md:px-6 py-3 mb-5"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs rounded-full border border-indigo-400/30 bg-indigo-500/10 text-indigo-200">
              DSA · {normalizedDifficulty}
            </span>
            <span className="text-xs text-slate-300">
              Q{current + 1} of {totalQuestions}
            </span>
          </div>

          <div className="justify-self-start md:justify-self-center flex items-center gap-3">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  stroke={timerUrgent ? "#FB7185" : "#6366F1"}
                  strokeWidth="4"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold">
                <Timer className="w-3 h-3" />
              </span>
            </div>
            <span
              className={`font-mono text-sm ${timerUrgent ? "text-rose-300" : "text-indigo-300"}`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="justify-self-end">
            <button
              onClick={() => navigate("/practice")}
              className="px-3 py-1.5 rounded-lg border border-white/15 text-sm text-slate-300 hover:text-rose-300 hover:border-rose-300/50 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <section className="lg:col-span-2 relative rounded-3xl border border-white/10 bg-[#111118]/90 p-5 md:p-7 overflow-hidden">
          <span className="absolute right-3 top-0 text-[120px] md:text-[160px] leading-none font-['Syne'] text-white/5 select-none">
            {current + 1}
          </span>
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">
              Interview Question
            </p>
            <h2 className="font-['Syne'] text-2xl md:text-3xl leading-tight text-slate-100">
              {q?.question ||
                "Design a scalable architecture for a real-time analytics dashboard handling high-throughput event streams."}
            </h2>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <span
                className={`px-3 py-1 text-xs rounded-full border ${difficultyStyle}`}
              >
                {normalizedDifficulty}
              </span>
              <button
                onClick={() => setIsHintOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border border-cyan-300/30 text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                {isHintOpen ? "Hide Hint" : "Show Hint"}
              </button>
            </div>

            <AnimatePresence>
              {isHintOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 8, height: 0 }}
                  className="mt-4 rounded-xl border border-white/15 bg-white/5 backdrop-blur p-4 text-sm text-slate-200"
                >
                  {hintText}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs border border-white/15 text-slate-300 bg-black/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <motion.section
          initial={{ x: 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-3 rounded-3xl border border-white/10 bg-[#111118]/90 p-5 md:p-7"
        >
          <div className="relative">
            <textarea
              disabled={isSubmitted}
              value={answers[current] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [current]: e.target.value }))
              }
              placeholder="Type your answer here... think out loud, be thorough."
              className="w-full min-h-[270px] md:min-h-[360px] rounded-2xl border border-white/10 bg-[#0B0B12] p-4 md:p-5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400/50 shadow-[inset_0_0_40px_rgba(99,102,241,0.08)] disabled:opacity-70"
            />
            <div className="absolute bottom-3 right-3 text-[11px] text-slate-400">
              {String(userAnswer).trim().split(/\s+/).filter(Boolean).length} words ·{" "}
              {String(userAnswer).length} chars
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={submitCurrentAnswer}
              disabled={!String(userAnswer).trim() || isSubmitted}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              Submit Answer <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-400 text-right">Ctrl+Enter to submit</p>
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-white/15 bg-[#0E0F17] p-5 md:p-8 max-h-[86vh] overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200">
                    Overall Score
                    <span className="font-semibold">{feedbackData.score}%</span>
                  </div>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="p-2 rounded-lg border border-white/15 hover:border-white/30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {feedbackData.metrics.map((metric) => (
                    <div
                      key={metric.key}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">{metric.key}</span>
                        <span className="text-slate-200">{metric.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 0.7 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                    AI Feedback
                  </p>
                  <p className="text-slate-200 leading-relaxed min-h-[72px]">
                    {typedFeedback}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={nextQuestion}
                    className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 font-semibold inline-flex items-center justify-center gap-2"
                  >
                    Next Question <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="flex-1 py-3 rounded-xl border border-white/15 hover:border-white/30 text-slate-200"
                  >
                    Review Answer
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
