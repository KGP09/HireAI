import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Loader2, Sparkles, ChevronRight, Cpu } from "lucide-react";
import { axiosInstance } from "../lib/axios";

export default function TelephonicSetup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Software Engineer");
  const [isGenerating, setIsGenerating] = useState(false);

  const startSimulation = async () => {
    setIsGenerating(true);
    try {
      // 1. Request question generation from your backend
      const res = await axiosInstance.post(
        "http://localhost:5004/api/ai/generate-round",
        {
          role: role,
          type: "telephonic",
        },
      );

      // 2. Navigate to the Telephonic UI with the AI-generated payload
      navigate("/telephonic", {
        state: {
          round: res.data.round,
          index: Date.now(), // Unique Test ID
          rIndex: 0,
        },
      });
    } catch (err) {
      console.error("AI Node Connection Failed:", err);
      alert("Backend error: Ensure Ollama/AI service is reachable.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen bg-[#030711] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Phone className="text-emerald-400 w-10 h-10" />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white italic tracking-tight mb-2 uppercase">
              Aural Node
            </h2>
            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">
              Initializing Telephonic Logic
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-2 block">
                Career Domain
              </label>
              <div className="relative">
                <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. System Architect"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <button
              onClick={startSimulation}
              disabled={isGenerating || !role}
              className="w-full group relative overflow-hidden py-5 bg-white text-black rounded-2xl font-black tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Orchestrating...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Initialize Signal{" "}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
