// import toast from "react-hot-toast";
// import { useAIStore } from "../store/useAIStore";
// import { useAuthStore } from "../store/useAuthStore";
// import { useState } from "react";
// import { Sparkle } from "lucide-react";
// export default function PromtComponent() {
//   const { authUser } = useAuthStore();
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { createTest } = useAIStore();
//   const handlePromptSubmit = async () => {
//     if (!input.trim())
//       return toast.error("Please describe the interview process.");
//     // setLoading(true);
//     try {
//       const data = {
//         description: input,
//         id: authUser._id,
//       };
//       console.log("Prompt Data: ", data);
//       await createTest(data);
//       setInput("");
//     } catch (error) {
//       console.error("Error creating test:", error);
//       toast.error(error.response?.data?.message || "Failed to create test");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <>
//       <div className="p-6 space-y-6">
//         <h1 className="text-2xl font-bold">Welcome, {authUser?.username}!</h1>
//         <p className="text-base text-gray-500">
//           Prompt the system about your interview flow
//         </p>

//         <div className="bg-base-100 p-6 rounded-xl shadow space-y-4 border border-base-200">
//           <label className="label">
//             <span className="label-text font-semibold text-lg">
//               Describe the Interview
//             </span>
//           </label>
//           <textarea
//             className="textarea textarea-bordered w-full min-h-[100px]"
//             placeholder="e.g. The interview will have 3 rounds: Aptitude, Technical, HR. Each should be timed and scored..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//           />
//           <button
//             className="btn btn-primary flex gap-2"
//             disabled={loading}
//             onClick={handlePromptSubmit}
//           >
//             {loading && <span className="loading loading-spinner"></span>}
//             <Sparkle className="w-5 h-5" />
//             Generate Rounds
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Lightbulb, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";

// Replace with your actual imports
import { useAIStore } from "../store/useAIStore";
import { useAuthStore } from "../store/useAuthStore";

const suggestions = [
  "3 rounds: Aptitude (10 MCQs), Technical (5 coding questions), HR interview",
  "Start with a personality assessment, then move to domain-specific questions",
  "Quick 15-minute screening with behavioral and situational questions",
];

export default function PromtComponent() {
  const { authUser } = useAuthStore();
  const { createTest } = useAIStore();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePromptSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: "Missing description",
        description: "Please describe the interview process.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        description: input,
        id: authUser._id,
      };
      console.log("Prompt Data: ", data);
      await createTest(data);
      setInput("");
      toast({
        title: "Success!",
        description: "Your interview rounds are being generated.",
      });
    } catch (error) {
      console.error("Error creating test:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              {authUser?.username}
            </span>
            !
          </h1>
          <p className="text-muted-foreground text-lg">
            Describe your ideal interview process and let AI create it for you.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                  <Wand2 className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Create Interview Flow
                  </CardTitle>
                  <CardDescription>
                    Be specific about rounds, timing, and question types
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Interview Description
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g. The interview will have 3 rounds: Aptitude, Technical, HR..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[160px] resize-none bg-background/50 border-border/50 focus:border-violet-500/50 transition-colors"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  <span>Try these suggestions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 text-xs rounded-full border border-border/50 bg-muted/50 hover:bg-muted hover:border-violet-500/30 transition-colors text-left"
                    >
                      {suggestion.length > 50
                        ? suggestion.slice(0, 50) + "..."
                        : suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={handlePromptSubmit}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Interview Rounds
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-dashed border-border/50 bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 shrink-0">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Pro Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Specify the number of rounds and questions per round
                    </li>
                    <li>• Mention time limits for each section</li>
                    <li>• Include difficulty levels (easy, medium, hard)</li>
                    <li>• Add specific topics or skills to assess</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
