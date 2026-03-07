import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useTestStore } from "../store/useTestStore";
import RecordRTC from "recordrtc";

function Telephonic() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { round } = state || {};

  if (!round) return <p>Invalid navigation</p>;

  const questions = round.questions;

  const [currentQnIndex, setCurrentQnIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const processingRef = useRef(new Set());
  const timerRef = useRef(null);

  const { transcribeAudio, evaluateTelephonic } = useTestStore();

  const currentQuestion = questions[currentQnIndex];
  const isLocked = lockedQuestions[currentQuestion._id];

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // ✅ FIX: Only cleanup on component unmount, NOT when isRecording changes
  useEffect(() => {
    return () => {
      // This only runs when component unmounts
      console.log("🧹 Component unmounting, cleaning up...");

      if (recorderRef.current) {
        try {
          if (recorderRef.current.getState() === "recording") {
            recorderRef.current.stopRecording();
          }
        } catch (e) {
          console.log("Cleanup recorder error:", e);
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          console.log("🛑 Stopping track on unmount:", track.label);
          track.stop();
        });
        streamRef.current = null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // ✅ Empty dependency array - only run on unmount

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isRecording || loading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRecording, loading]);

  const startRecording = async () => {
    console.log("🎤 startRecording called");

    if (isRecording || isLocked) {
      console.log(
        "❌ Blocked: isRecording=",
        isRecording,
        "isLocked=",
        isLocked,
      );
      return;
    }

    setError(null);
    setRecordingTime(0);

    try {
      console.log("📡 Requesting microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      });

      streamRef.current = stream;

      // Check track health
      const audioTracks = stream.getAudioTracks();
      console.log("🎵 Audio tracks:", audioTracks.length);

      if (audioTracks.length === 0) {
        throw new Error("No audio tracks found in stream");
      }

      audioTracks.forEach((track, i) => {
        console.log(`Track ${i}:`, {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label,
        });

        // Monitor for unexpected track ending
        track.onended = () => {
          //consolee.error("⚠️ Track ended unexpectedly!");
          if (isRecording) {
            setError(
              "Microphone disconnected. Please check permissions and try again.",
            );
            setIsRecording(false);
          }
        };

        track.onmute = () => {
          console.warn("⚠️ Track muted!");
        };
      });

      // Verify track is actually live
      const track = audioTracks[0];
      if (track.readyState !== "live") {
        throw new Error(`Track not live. State: ${track.readyState}`);
      }

      console.log("🔧 Creating RecordRTC recorder");

      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        timeSlice: 1000,
        ondataavailable: (blob) => {
          console.log("📦 Data chunk:", blob.size, "bytes");
        },
      });

      recorderRef.current = recorder;

      console.log("▶️ Starting recording");
      recorder.startRecording();
      setIsRecording(true);
      console.log("✅ Recording started successfully");
    } catch (error) {
      console.error("❌ Failed to start recording:", error);

      let errorMessage = "Failed to start recording. ";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "🚫 Microphone permission denied!\n\n" +
          "Please:\n" +
          "1. Check Windows Settings → Privacy → Microphone\n" +
          "2. Enable microphone for your browser\n" +
          "3. Click 'Allow' when browser asks for permission";
      } else if (error.name === "NotFoundError") {
        errorMessage =
          "🎤 No microphone detected!\n\n" +
          "Please connect a microphone and try again.";
      } else if (error.name === "NotReadableError") {
        errorMessage =
          "⚠️ Microphone is being used by another application!\n\n" +
          "Please close other apps and try again.";
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      alert(errorMessage);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    console.log("⏹️ stopRecording called");

    if (!recorderRef.current || !isRecording) {
      console.log("❌ No recorder or not recording");
      return;
    }

    // Check minimum duration BEFORE processing
    if (recordingTime < 2) {
      const confirmShort = window.confirm(
        `Recording is only ${recordingTime} second(s). This might be too short.\n\n` +
          `Continue anyway? (Recommended: 3+ seconds)`,
      );

      if (!confirmShort) {
        return;
      }
    }

    console.log("🛑 Stopping recorder");
    setIsRecording(false);

    recorderRef.current.stopRecording(async () => {
      console.log("✅ Recording stopped, processing...");

      const qId = currentQuestion._id;

      if (processingRef.current.has(qId)) {
        console.log("⚠️ Already processing this question");
        return;
      }
      if (answers[qId]) {
        console.log("⚠️ Answer already exists");
        return;
      }

      processingRef.current.add(qId);

      try {
        setLoading(true);
        setError(null);

        const audioBlob = recorderRef.current.getBlob();
        console.log("💾 Audio blob:", {
          size: audioBlob.size,
          type: audioBlob.type,
          duration: recordingTime + "s",
        });

        // Validate blob size BEFORE sending
        if (audioBlob.size < 1000) {
          throw new Error(
            `Recording too small (${audioBlob.size} bytes).\n\n` +
              `This usually means:\n` +
              `1. Windows Privacy Settings blocked microphone\n` +
              `2. Recording was too short\n` +
              `3. Browser permissions issue\n\n` +
              `Please check:\n` +
              `- Windows Settings → Privacy → Microphone → Enable for browser\n` +
              `- Browser microphone permissions\n` +
              `- Try Chrome or Edge browser`,
          );
        }

        console.log("📤 Sending to transcription service...");

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        const transcript = await transcribeAudio(formData);

        console.log(
          "✅ Transcription received:",
          transcript.substring(0, 50) + "...",
        );

        setAnswers((prev) => ({
          ...prev,
          [qId]: transcript,
        }));

        setError(null);
      } catch (error) {
        console.error("❌ Processing error:", error);

        let errorMsg = "Transcription failed. ";

        if (error.response) {
          errorMsg += error.response.data?.message || error.response.statusText;
        } else if (error.message) {
          errorMsg = error.message;
        }

        setError(errorMsg);
        alert(errorMsg + "\n\nThis answer has been locked.");
      } finally {
        setLockedQuestions((prev) => ({
          ...prev,
          [qId]: true,
        }));

        setLoading(false);
        setRecordingTime(0);

        // Clean up stream after processing
        if (streamRef.current) {
          console.log("🧹 Cleaning up stream after recording");
          streamRef.current.getTracks().forEach((track) => {
            console.log("🛑 Stopping track:", track.label);
            track.stop();
          });
          streamRef.current = null;
        }

        processingRef.current.delete(qId);
      }
    });
  };

  const handleNext = () => {
    if (!answers[currentQuestion._id]) {
      alert("Please record your answer before proceeding.");
      return;
    }

    setError(null);
    setCurrentQnIndex((i) => i + 1);
  };

  const handleSubmit = async () => {
    if (submitted) return;

    if (!answers[currentQuestion._id]) {
      alert("Please record your answer before submitting.");
      return;
    }

    setSubmitted(true);

    const data = {
      testIndex: state.index,
      roundIndex: state.rIndex,
      roundType: round.roundType,
      answers,
    };

    try {
      await evaluateTelephonic(data);
      toast.success("Assessment Complete! Review your score in the Archive.");
      navigate("/history"); // Redirect to history to see the result
    } catch (error) {
      toast.error("Cloud sync failed. Retrying...");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-[#05070a] text-slate-200 font-sans p-8 overflow-hidden flex flex-col items-center justify-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-3xl flex flex-col gap-8 relative z-10">
        {/* Header Info */}
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-500 mb-2">
              Protocol: {round.roundType}
            </h2>
            <h1 className="text-3xl font-bold text-white italic">
              Aural Assessment Node
            </h1>
          </div>
          <div className="text-right font-mono text-xs text-slate-500">
            STG // {currentQnIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Animated Background Wave for "Telephonic" feel */}
          <div
            className={`absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center`}
          >
            <div
              className={`w-full h-1 bg-blue-400 transition-all duration-500 ${isRecording ? "animate-pulse scale-y-[20]" : "scale-y-1"}`}
            />
          </div>

          <p className="text-2xl font-light leading-relaxed relative z-10 text-center">
            {currentQuestion.question}
          </p>
        </div>

        {/* Recording Logic UI */}
        <div className="flex flex-col items-center gap-6">
          {/* Status HUD */}
          <div
            className={`flex items-center gap-4 px-6 py-3 rounded-full border transition-all ${
              isRecording
                ? "bg-red-500/10 border-red-500/50"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="relative flex h-3 w-3">
              {isRecording && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? "bg-red-500" : "bg-blue-500"}`}
              />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest">
              {isRecording
                ? `Capture Active: ${formatTime(recordingTime)}`
                : loading
                  ? "Processing Signal..."
                  : "Receiver Ready"}
            </span>
          </div>

          {/* The Action Button */}
          <button
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            disabled={loading || isLocked}
            className={`group relative p-8 rounded-full transition-all duration-500 ${
              isRecording
                ? "bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.4)] scale-110"
                : isLocked
                  ? "bg-slate-800 opacity-50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading ? (
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            ) : (
              <Mic
                className={`w-10 h-10 text-white ${isRecording ? "animate-pulse" : ""}`}
              />
            )}
          </button>

          {/* Transcript Area */}
          {answers[currentQuestion._id] && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-3 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Signal Transcribed
                  </span>
                </div>
                <p className="text-sm text-slate-400 italic line-clamp-3">
                  "{answers[currentQuestion._id]}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-center mt-4">
          {currentQnIndex < questions.length - 1 ? (
            <button
              className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-blue-400 hover:text-white transition-all disabled:opacity-20"
              onClick={handleNext}
              disabled={!answers[currentQuestion._id]}
            >
              Next Transmission <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="px-10 py-4 bg-emerald-600 text-white rounded-full font-black tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
              onClick={handleSubmit}
              disabled={!answers[currentQuestion._id] || submitted}
            >
              {submitted ? "Finalizing..." : "TERMINATE & SUBMIT"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Telephonic;
