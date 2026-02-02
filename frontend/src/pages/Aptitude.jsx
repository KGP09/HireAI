import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "../store/useAuthStore";
import { useParams } from "react-router-dom"; // Add this
import {
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Aptitude() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  // const { roundType, index } = useParams(); // Grab the dynamic parts
  const { index } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!authUser?._id) return;
      try {
        const res = await axiosInstance.post("/tests/get-tests", {
          id: authUser._id,
        });

        console.log("1. Total Tests Found:", res.data.length);

        if (res.data.length > 0) {
          // Sort them
          const sortedTests = [...res.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );

          const latestTest = sortedTests[0];
          console.log("2. Latest Test Object:", latestTest);
          console.log(
            "3. Number of rounds in this test:",
            latestTest.rounds?.length,
          );
          console.log("4. The index from URL is:", index);

          const roundIdx = parseInt(index);
          const currentRound = latestTest.rounds[roundIdx];

          if (!currentRound) {
            console.error(
              `❌ ERROR: Round at index ${roundIdx} does not exist!`,
            );
            console.log("Available Rounds:", latestTest.rounds);
          } else {
            console.log("✅ Found Round:", currentRound);
            console.log(
              "Available keys in this round:",
              Object.keys(currentRound),
            );
          }
          if (currentRound.questions && Array.isArray(currentRound.questions)) {
            setQuestions(currentRound.questions);
            console.log("🚀 Success: Questions set to state!");
          } else {
            console.error(
              "❌ Key 'questions' missing or not an array:",
              currentRound,
            );
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

  const handleSubmit = async () => {
    setIsEvaluating(true);
    let calculatedScore = 0;

    questions.forEach((q, idx) => {
      if (q.options[answers[idx]] === q.correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);

    try {
      const feedbackRes = await axiosInstance.post("/ai/get-feedback", {
        score: calculatedScore,
        total: questions.length,
        roundType: "Aptitude",
      });
      setAiFeedback(feedbackRes.data.feedback);
    } catch (error) {
      setAiFeedback("Great job! You've completed the Aptitude round.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // --- CONDITIONAL RENDERS (Order matters!) ---

  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <p>Loading AI Questions...</p>
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">No Questions Found</h2>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-4">
          Go to Dashboard
        </button>
      </div>
    );

  if (submitted)
    return (
      <div className="card w-96 bg-base-100 shadow-xl mx-auto mt-10">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-success text-2xl">Round Finished!</h2>
          <div className="text-5xl font-bold my-4">
            {score}/{questions.length}
          </div>
          <div className="bg-base-200 p-4 rounded-lg text-sm italic mb-4 text-left w-full">
            <span className="font-bold text-primary block">AI Feedback:</span>
            {isEvaluating ? (
              <span className="loading loading-dots loading-xs"></span>
            ) : (
              aiFeedback
            )}
          </div>
          <button
            onClick={() => navigate("/practice")}
            className="btn btn-primary btn-block"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  const q = questions[current];

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-6">
        <span className="badge badge-outline p-4 font-mono">
          Q {current + 1} of {questions.length}
        </span>
        <div className="w-1/2 bg-base-300 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-8">{q.question}</h3>

      {/* --- Choice Logic: Buttons for Aptitude/Tech, Textarea for HR --- */}
      <div className="mt-4">
        {q.options && q.options.length > 0 ? (
          // Render Multiple Choice Buttons
          <div className="grid gap-4">
            {q.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [current]: idx })}
                className={`btn btn-lg justify-start normal-case text-left h-auto py-4 ${
                  answers[current] === idx
                    ? "btn-primary"
                    : "btn-ghost border-base-300"
                }`}
              >
                <span className="w-8 h-8 rounded-full border flex items-center justify-center mr-3 text-sm">
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </button>
            ))}
          </div>
        ) : (
          // Render Text Input for Open-Ended Questions (HR/Telephonic)
          <div className="form-control">
            <textarea
              className="textarea textarea-bordered h-40 text-lg p-4 focus:ring-2 focus:ring-primary"
              placeholder="Type your detailed answer here..."
              value={answers[current] || ""}
              onChange={(e) =>
                setAnswers({ ...answers, [current]: e.target.value })
              }
            />
            <p className="text-xs text-base-content/50 mt-2">
              Note: This is an open-ended question. AI will evaluate your
              response sentiment.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-10 border-t pt-6">
        <button
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
          className="btn btn-ghost gap-2"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {current === questions.length - 1 ? (
          <button onClick={handleSubmit} className="btn btn-success gap-2 px-8">
            Submit Round <Send size={18} />
          </button>
        ) : (
          <button
            disabled={answers[current] === undefined}
            onClick={() => setCurrent((c) => c + 1)}
            className="btn btn-primary gap-2 px-8"
          >
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
