import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic,
  Brain,
  Shield,
  BarChart3,
  MessageSquare,
  FolderKanban,
  ArrowRight,
  Sparkles,
  Cpu,
  Database,
  Server,
  Workflow,
  Code2,
  Waves,
  CheckCircle2,
} from "lucide-react";

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerWrap = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const SocialTicker = () => {
  const line =
    "Built for CSE students · Powered by Llama3 · Runs 100% locally · No data leaves your machine";
  return (
    <section className="border-y border-white/10 bg-[#111118]/90 py-3 overflow-hidden">
      <motion.div
        className="flex gap-14 whitespace-nowrap text-sm text-slate-300/90 font-['DM_Sans']"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <span>{line}</span>
        <span>{line}</span>
        <span>{line}</span>
      </motion.div>
    </section>
  );
};

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-20">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(167,139,250,0.24),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(34,211,238,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:38px_38px] opacity-30" />
      {[
        "left-[8%] top-[16%]",
        "left-[14%] top-[44%]",
        "left-[22%] top-[29%]",
        "left-[29%] top-[68%]",
        "left-[36%] top-[23%]",
        "left-[43%] top-[58%]",
        "left-[50%] top-[18%]",
        "left-[58%] top-[47%]",
        "left-[65%] top-[33%]",
        "left-[72%] top-[64%]",
        "left-[79%] top-[27%]",
        "left-[86%] top-[52%]",
      ].map((pos, i) => (
        <motion.span
          key={pos}
          className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-violet-300/50`}
          initial={{ opacity: 0.15, y: 0 }}
          animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -18, 0] }}
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>

    <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center">
      <motion.div
        variants={staggerWrap}
        initial="hidden"
        animate="show"
        className="space-y-7"
      >
        <motion.p
          variants={sectionReveal}
          className="w-fit px-4 py-1.5 rounded-full border border-indigo-400/40 bg-indigo-500/10 text-indigo-200 text-xs tracking-[0.2em] uppercase font-semibold"
        >
          Adaptive Interview Copilot
        </motion.p>
        <motion.h1
          variants={sectionReveal}
          className="font-['Syne'] text-4xl sm:text-5xl lg:text-7xl leading-[1.05] tracking-tight text-slate-50"
        >
          Ace Every Interview.
          <br />
          Powered by AI.
        </motion.h1>
        <motion.p
          variants={sectionReveal}
          className="max-w-xl text-slate-300 text-base sm:text-lg leading-relaxed font-['DM_Sans']"
        >
          Hire AI simulates real technical interviews, evaluates your answers in
          real-time, and adapts to your skill level - all locally, privately.
        </motion.p>
        <motion.div variants={sectionReveal} className="flex flex-wrap gap-4">
          <Link
            to="/interviews"
            className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 font-semibold font-['DM_Sans'] transition-colors"
          >
            Start Practicing{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 hover:border-indigo-300/60 bg-white/5 hover:bg-white/10 text-slate-100 px-6 py-3 font-semibold font-['DM_Sans'] transition-colors"
          >
            See How It Works
          </a>
        </motion.div>
      </motion.div>

      <motion.article
        initial={{ opacity: 0, x: 30, rotate: 2 }}
        animate={{ opacity: 1, x: 0, rotate: -2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ y: -8, rotate: -1.2 }}
        className="relative rounded-3xl border border-indigo-300/25 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_80px_rgba(99,102,241,0.25)]"
      >
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-400/20 to-cyan-300/20 blur-lg -z-10" />
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200 font-semibold">
            Live Mock Interview
          </p>
          <Sparkles className="w-4 h-4 text-cyan-300" />
        </div>
        <div className="space-y-4 font-['DM_Sans']">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs text-slate-400 mb-2">Question</p>
            <p className="text-slate-100">
              How would you design cache invalidation for a high-traffic feed
              service?
            </p>
          </div>
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-4">
            <p className="text-xs text-emerald-200 mb-2">AI Feedback</p>
            <p className="text-emerald-100">
              Strong tradeoff framing. Add consistency guarantees and failure
              recovery strategy.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Clarity", value: "91%" },
              { label: "Depth", value: "88%" },
              { label: "Structure", value: "94%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-black/25 p-2 text-center"
              >
                <p className="text-[10px] uppercase text-slate-400">
                  {stat.label}
                </p>
                <p className="text-sm text-white font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  </section>
);

const featureCards = [
  {
    icon: Mic,
    title: "Speech Practice Mode",
    desc: "Speak your answers aloud and get scored on Clarity, Structure, Confidence and Conciseness",
    span: "lg:col-span-4",
  },
  {
    icon: Brain,
    title: "Adaptive Questioning",
    desc: "AI adjusts difficulty based on your past performance",
    span: "lg:col-span-2",
  },
  {
    icon: Shield,
    title: "100% Local AI",
    desc: "Ollama + Llama3 runs entirely on your machine. Zero cloud.",
    span: "lg:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Performance Dashboard",
    desc: "Track your scores, streaks, and weak topics over time",
    span: "lg:col-span-4",
  },
  {
    icon: MessageSquare,
    title: "Real-time Feedback",
    desc: "Instant evaluation after every answer with detailed improvement tips",
    span: "lg:col-span-3",
  },
  {
    icon: FolderKanban,
    title: "Topic-wise Practice",
    desc: "DSA, System Design, OS, DBMS, and more",
    span: "lg:col-span-3",
  },
];

const FeaturesGrid = () => (
  <section className="py-20 px-6 lg:px-10">
    <div className="max-w-7xl mx-auto">
      <motion.div
        variants={sectionReveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mb-10"
      >
        <h2 className="font-['Syne'] text-3xl sm:text-4xl text-slate-50">
          Features That Feel Like Real Interviews
        </h2>
      </motion.div>
      <motion.div
        variants={staggerWrap}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-6 gap-4"
      >
        {featureCards.map((card) => (
          <motion.article
            key={card.title}
            variants={sectionReveal}
            whileHover={{ y: -8, scale: 1.01 }}
            className={`${card.span} rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 relative overflow-hidden group`}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-indigo-500/10 via-violet-400/10 to-cyan-300/10" />
            <div className="relative z-10">
              <card.icon className="w-6 h-6 text-indigo-300 mb-4" />
              <h3 className="text-lg text-slate-100 font-semibold mb-2 font-['DM_Sans']">
                {card.title}
              </h3>
              <p className="text-sm text-slate-300 font-['DM_Sans']">
                {card.desc}
              </p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </div>
  </section>
);

const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      title: "Choose Your Topic",
      desc: "Select role, domain, and interview style to begin a tailored session.",
      icon: FolderKanban,
    },
    {
      num: "02",
      title: "Answer the Question",
      desc: "Respond by voice or text while the AI probes deeper, just like a real panel.",
      icon: MessageSquare,
    },
    {
      num: "03",
      title: "Get AI Feedback",
      desc: "Review strengths, weak spots, and concrete next actions after each turn.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="font-['Syne'] text-3xl sm:text-4xl text-slate-50 mb-12"
        >
          How It Works
        </motion.h2>
        <div className="relative">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="hidden md:block absolute left-0 right-0 top-14 border-t border-dashed border-indigo-300/30 origin-left"
          />
          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {steps.map((step) => (
              <motion.article
                key={step.num}
                variants={sectionReveal}
                className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6 backdrop-blur"
              >
                <p className="text-4xl font-['Syne'] text-indigo-300 mb-4">
                  {step.num}
                </p>
                <step.icon className="w-5 h-5 text-cyan-300 mb-3" />
                <h3 className="text-xl text-slate-100 font-semibold font-['DM_Sans'] mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-300 text-sm font-['DM_Sans']">
                  {step.desc}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SpeechModeHighlight = () => (
  <section className="py-20 px-6 lg:px-10 bg-[#111118] border-y border-white/10">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <motion.div
        variants={sectionReveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <h2 className="font-['Syne'] text-3xl sm:text-5xl text-slate-50 mb-5">
          Your Voice. Your Practice.
        </h2>
        <ul className="space-y-3 text-slate-200 font-['DM_Sans']">
          <li className="flex gap-2">
            <span className="text-cyan-300">•</span> Practice timed spoken
            answers with realistic pressure.
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-300">•</span> Get instant metrics on
            delivery and communication quality.
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-300">•</span> Track confidence
            improvements across sessions.
          </li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6"
      >
        <div className="rounded-2xl border border-indigo-300/20 bg-[#0A0A0F] p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-200 font-['DM_Sans']">
              Speech Session
            </p>
            <Waves className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="flex items-end gap-1 h-14 mb-6">
            {[16, 26, 18, 34, 28, 20, 30, 24, 36, 22, 29, 17].map((h, i) => (
              <motion.span
                key={i}
                className="w-2 rounded bg-gradient-to-t from-indigo-500 to-cyan-300"
                animate={{ height: [h, h + 12, h] }}
                transition={{
                  duration: 1.2 + (i % 3) * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Clarity", val: 88 },
              { label: "Structure", val: 91 },
              { label: "Confidence", val: 84 },
              { label: "Conciseness", val: 86 },
            ].map((score) => (
              <div
                key={score.label}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-xs text-slate-400 mb-1 font-['DM_Sans']">
                  {score.label}
                </p>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${score.val}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9 }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const TechStack = () => {
  const tech = [
    { name: "React", icon: Code2 },
    { name: "Vite", icon: Sparkles },
    { name: "Tailwind CSS", icon: Workflow },
    { name: "Framer Motion", icon: Waves },
    { name: "Node.js", icon: Server },
    { name: "Express", icon: Server },
    { name: "MongoDB", icon: Database },
    { name: "Ollama", icon: Cpu },
    { name: "Llama3", icon: Brain },
    { name: "Web Speech API", icon: Mic },
  ];

  return (
    <section className="py-20 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="font-['Syne'] text-3xl sm:text-4xl text-slate-50 mb-10"
        >
          Built with modern, open-source tools
        </motion.h2>
        <motion.div
          variants={staggerWrap}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap gap-3"
        >
          {tech.map((item) => (
            <motion.div
              key={item.name}
              variants={sectionReveal}
              whileHover={{ y: -4, scale: 1.03 }}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
            >
              <item.icon className="w-4 h-4 text-indigo-300" />
              <span className="text-sm text-slate-100 font-['DM_Sans']">
                {item.name}
              </span>
              <span className="h-4 w-0.5 bg-gradient-to-b from-transparent via-cyan-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const CtaFooter = () => (
  <section className="relative py-24 px-6 lg:px-10 border-t border-white/10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.24),transparent_55%)] pointer-events-none" />
    <motion.div
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="relative max-w-3xl mx-auto text-center"
    >
      <h2 className="font-['Syne'] text-4xl sm:text-5xl text-slate-50 mb-4">
        Ready to land your dream job?
      </h2>
      <p className="text-slate-300 text-lg mb-8 font-['DM_Sans']">
        No subscriptions. No cloud. Just you and AI.
      </p>
      <Link
        to="/interviews"
        className="relative inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 px-7 py-3.5 text-white font-semibold font-['DM_Sans'] transition-colors"
      >
        <motion.span
          className="absolute -inset-1 rounded-xl border border-indigo-300/50"
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
        />
        Start Practicing Now
      </Link>
    </motion.div>
  </section>
);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-[#F8FAFC] font-['DM_Sans']">
      <HeroSection />
      <SocialTicker />
      <FeaturesGrid />
      <HowItWorks />
      <SpeechModeHighlight />
      <TechStack />
      <CtaFooter />
    </main>
  );
}
