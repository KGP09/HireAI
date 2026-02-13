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
  Brain,
  Clock,
  Users,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore"; // Added this import

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const features = [
  {
    to: "/create",
    icon: Sparkles,
    title: "Create Test",
    description: "Generate AI-powered interview rounds tailored to any role",
    gradient: "from-violet-500 to-purple-600",
    primary: true,
  },
  {
    to: "/interviews",
    icon: MessageCircle,
    title: "Start Interview",
    description: "View and begin mock interviews assigned to you",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    to: "/history",
    icon: Clock,
    title: "Interview History",
    description: "Review your past performance and AI feedback transcripts",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    to: "/settings",
    icon: Settings,
    title: "Settings",
    description: "Manage your profile and preferences",
    gradient: "from-orange-500 to-amber-500",
  },
];

export default function HomePage() {
  const { authUser } = useAuthStore(); // Initialize auth store
  const [realStats, setRealStats] = useState([
    {
      label: "Interviews Completed",
      value: "0",
      icon: MessageCircle,
      trend: "0%",
    },
    { label: "Success Rate", value: "0%", icon: Target, trend: "0%" },
    { label: "Latest Score", value: "N/A", icon: Zap, trend: "New" },
    { label: "Avg. Score", value: "0", icon: TrendingUp, trend: "0%" },
  ]);

  useEffect(() => {
    const getStats = async () => {
      if (!authUser?._id) {
        console.log("Waiting for user session...");
        return;
      }

      try {
        const res = await axiosInstance.get("/user/my-history");
        const historyData = res.data;

        if (historyData && historyData.length > 0) {
          const totalScore = historyData.reduce(
            (acc, curr) => acc + (curr.feedback?.score || 0),
            0,
          );
          const avgScore = Math.round(totalScore / historyData.length);
          const successCount = historyData.filter(
            (h) => h.feedback?.score >= 50,
          ).length;
          const successRate = Math.round(
            (successCount / historyData.length) * 100,
          );

          setRealStats([
            {
              label: "Interviews Completed",
              value: historyData.length.toString(),
              icon: MessageCircle,
              trend: `+${historyData.length}`,
            },
            {
              label: "Success Rate",
              value: `${successRate}%`,
              icon: Target,
              trend: successRate > 70 ? "High" : "Stable",
            },
            {
              label: "Latest Score",
              value: `${historyData[0].overallScore}%`,
              icon: Zap,
              trend: "Latest",
            },
            {
              label: "Avg. Score",
              value: avgScore.toString(),
              icon: TrendingUp,
              trend: avgScore > 50 ? "+Up" : "Steady",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    getStats();
  }, [authUser]); // Re-run when authUser is loaded

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Interview Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Master Your Next
              <span className="block bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Interview
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practice with AI-generated interviews, get instant feedback, and
              land your dream job with confidence.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {realStats.map((stat) => (
              <motion.div key={stat.label} variants={item}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-5 h-5 text-muted-foreground" />
                      <span
                        className={`text-xs font-medium ${stat.trend.startsWith("+") || stat.trend === "High" ? "text-emerald-500" : "text-muted-foreground"}`}
                      >
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Link to={feature.to} className="block group">
                <Card
                  className={`relative overflow-hidden border-border/50 h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 ${feature.primary ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" : "bg-card hover:bg-accent/50"}`}
                >
                  <div
                    className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500`}
                  />
                  <CardContent className="relative p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div
                          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${feature.primary ? "bg-primary-foreground/20" : `bg-gradient-to-br ${feature.gradient}`}`}
                        >
                          <feature.icon
                            className={`w-6 h-6 ${feature.primary ? "text-primary-foreground" : "text-white"}`}
                          />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p
                          className={`text-sm ${feature.primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                        >
                          {feature.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
