import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Calendar,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  Zap,
  Target,
  Brain,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const stats = [
  {
    label: "Interviews Completed",
    value: "1,234",
    icon: MessageCircle,
    trend: "+12%",
  },
  { label: "Success Rate", value: "89%", icon: Target, trend: "+5%" },
  { label: "Active Users", value: "567", icon: Users, trend: "+23%" },
  { label: "Avg. Session", value: "24m", icon: Clock, trend: "-2m" },
];

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
    to: "/practice",
    icon: Brain,
    title: "Practice",
    description: "Access your generated tests and improve your skills",
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
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
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
            {stats.map((stat, index) => (
              <motion.div key={stat.label} variants={item}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-5 h-5 text-muted-foreground" />
                      <span
                        className={`text-xs font-medium ${stat.trend.startsWith("+") ? "text-emerald-500" : "text-muted-foreground"}`}
                      >
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
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
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={item}>
              <Link to={feature.to} className="block group">
                <Card
                  className={`relative overflow-hidden border-border/50 h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 ${feature.primary ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" : "bg-card hover:bg-accent/50"}`}
                >
                  {/* Decorative gradient blob */}
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
                        <h3
                          className={`text-xl font-semibold mb-2 ${feature.primary ? "text-primary-foreground" : "text-foreground"}`}
                        >
                          {feature.title}
                        </h3>
                        <p
                          className={`text-sm ${feature.primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                        >
                          {feature.description}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${feature.primary ? "text-primary-foreground" : "text-muted-foreground"}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Action CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="border-dashed border-2 border-border bg-muted/30">
            <CardContent className="py-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to ace your interview?
              </h3>
              <p className="text-muted-foreground mb-4">
                Start practicing with AI-generated questions tailored to your
                role.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/create">
                  <Sparkles className="w-4 h-4" />
                  Create Your First Test
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
