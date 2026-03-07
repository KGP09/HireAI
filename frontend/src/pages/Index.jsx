import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Settings,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Zap,
  Target,
  Clock,
  LayoutDashboard,
  ShieldCheck,
  BrainCircuit,
  ArrowUpRight,
  Video,
  Phone, // Added Phone for Telephonic
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

// Animation Variants (Keep these as they are)
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  const { authUser } = useAuthStore();
  const [realStats, setRealStats] = useState([
    {
      label: "Completed",
      value: "0",
      icon: ShieldCheck,
      color: "text-blue-500",
    },
    {
      label: "Success Rate",
      value: "0%",
      icon: Target,
      color: "text-emerald-500",
    },
    { label: "Latest Score", value: "N/A", icon: Zap, color: "text-amber-500" },
    {
      label: "Skill Level",
      value: "Novice",
      icon: BrainCircuit,
      color: "text-purple-500",
    },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!authUser?._id) return;
      try {
        const res = await axiosInstance.get("/user/my-history");
        const history = res.data;
        if (history?.length > 0) {
          const totalScore = history.reduce(
            (acc, curr) => acc + (curr.feedback?.score || 0),
            0,
          );
          const avg = Math.round(totalScore / history.length);
          setRealStats([
            {
              label: "Completed",
              value: history.length.toString(),
              icon: ShieldCheck,
              color: "text-blue-400",
            },
            {
              label: "Success Rate",
              value: `${Math.round((history.filter((h) => h.feedback?.score >= 60).length / history.length) * 100)}%`,
              icon: Target,
              color: "text-emerald-400",
            },
            {
              label: "Latest Score",
              value: `${history[0].feedback?.score || 0}%`,
              icon: Zap,
              color: "text-amber-400",
            },
            {
              label: "Skill Level",
              value: avg > 75 ? "Expert" : avg > 50 ? "Inter" : "Novice",
              icon: BrainCircuit,
              color: "text-purple-400",
            },
          ]);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };
    fetchDashboardData();
  }, [authUser]);

  return (
    <div className="min-h-screen bg-[#030711] text-slate-200 selection:bg-blue-500/30">
      {/* Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-blue-400 font-mono text-xs mb-4 tracking-widest uppercase"
          >
            <LayoutDashboard className="w-4 h-4" />
            Candidate Dashboard v2.0
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white via-slate-400 to-slate-800 bg-clip-text text-transparent"
          >
            Elevate Your <br />
            <span className="text-white">Professional Persona.</span>
          </motion.h1>
          <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
            Multi-modal interview simulations powered by adaptive AI. Practice
            video or voice rounds with real-time evaluation.
          </p>
        </header>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {realStats.map((stat, idx) => (
            <motion.div key={idx} variants={item}>
              <Card className="bg-white/[0.03] border-white/5 backdrop-blur-md hover:border-white/20 transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-2 rounded-lg bg-slate-900 border border-white/5 ${stat.color}`}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-3xl font-mono font-bold text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-6 gap-6"
        >
          {/* VIDEO MODE: 3-column span */}
          <Link to="/interviews" className="md:col-span-3 group">
            <motion.div
              variants={item}
              className="relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-800 p-8 shadow-2xl transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 group-hover:bg-white/20 transition-all" />
              <Video className="w-10 h-10 text-white/50 mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Video Simulation
              </h2>
              <p className="text-blue-100/70 text-sm mb-8">
                Full-stack environment with webcam tracking and technical
                deep-dives.
              </p>
              <div className="flex items-center gap-2 text-white font-bold text-[10px] bg-black/20 w-fit px-4 py-2 rounded-full backdrop-blur-md uppercase tracking-widest">
                Launch Visual Node <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </Link>

          {/* TELEPHONIC MODE: 3-column span */}
          <Link to="/telephonic-setup" className="md:col-span-3 group">
            <motion.div
              variants={item}
              className="relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-800 p-8 shadow-2xl transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 group-hover:bg-white/20 transition-all" />
              <Phone className="w-10 h-10 text-white/50 mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Telephonic Node
              </h2>
              <p className="text-emerald-100/70 text-sm mb-8">
                Audio-only assessment focusing on verbal articulation and logic.
              </p>
              <div className="flex items-center gap-2 text-white font-bold text-[10px] bg-black/20 w-fit px-4 py-2 rounded-full backdrop-blur-md uppercase tracking-widest text-emerald-100">
                Connect Aural Node <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </Link>

          {/* Row 2: Smaller Cards (History & Config) */}
          <Link to="/history" className="md:col-span-2 group">
            <motion.div
              variants={item}
              className="h-full rounded-[2rem] border border-white/5 bg-slate-900/50 p-8 backdrop-blur-sm hover:bg-slate-900 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                <Clock className="text-amber-400 w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Archive</h2>
              <p className="text-slate-500 text-sm mb-6">
                Review performance logs and transcript metrics.
              </p>
              <div className="text-amber-400 text-xs font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                OPEN LOGS <ArrowUpRight className="w-3 h-3" />
              </div>
            </motion.div>
          </Link>

          <Link to="/create" className="md:col-span-4 group">
            <motion.div
              variants={item}
              className="h-full rounded-[2rem] border border-white/5 bg-slate-900/50 p-8 backdrop-blur-sm hover:bg-slate-900 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                  <BrainCircuit className="text-purple-400 w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Configure Agent
                </h2>
                <p className="text-slate-500 text-sm">
                  Define custom roles, difficulty curves, and LLM persona.
                </p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl group-hover:bg-blue-500/10 transition-colors">
                <Settings className="text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all duration-700" />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
