import toast from "react-hot-toast";
import { useAIStore } from "../store/useAIStore";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { Sparkle } from "lucide-react";
export default function PromtComponent() {
  const { authUser } = useAuthStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { createTest } = useAIStore();
  const handlePromptSubmit = async () => {
    if (!input.trim())
      return toast.error("Please describe the interview process.");
    // setLoading(true);
    try {
      const data = {
        description: input,
        id: authUser._id,
      };
      console.log("Prompt Data: ", data);
      await createTest(data);
      setInput("");
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error(error.response?.data?.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Welcome, {authUser?.username}!</h1>
        <p className="text-base text-gray-500">
          Prompt the system about your interview flow
        </p>

        <div className="bg-base-100 p-6 rounded-xl shadow space-y-4 border border-base-200">
          <label className="label">
            <span className="label-text font-semibold text-lg">
              Describe the Interview
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full min-h-[100px]"
            placeholder="e.g. The interview will have 3 rounds: Aptitude, Technical, HR. Each should be timed and scored..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="btn btn-primary flex gap-2"
            disabled={loading}
            onClick={handlePromptSubmit}
          >
            {loading && <span className="loading loading-spinner"></span>}
            <Sparkle className="w-5 h-5" />
            Generate Rounds
          </button>
        </div>
      </div>
    </>
  );
}
