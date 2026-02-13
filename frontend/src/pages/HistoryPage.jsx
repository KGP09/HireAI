import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // You'll need to create this GET route in your backend
        const res = await axiosInstance.get("/user/my-history");
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading your history...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-blue-500">📜</span> Interview History
        </h1>

        {history.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-10 rounded-3xl text-center">
            <p className="text-gray-400">
              No interviews found. Ready to start your first one?
            </p>
            <button
              onClick={() => navigate("/interviews")}
              className="mt-4 text-blue-500 hover:underline"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900 border border-white/5 p-6 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer flex justify-between items-center"
                onClick={() =>
                  navigate("/results", { state: { report: item.feedback } })
                }
              >
                <div>
                  <h3 className="text-xl font-semibold text-blue-400">
                    {item.jobDescription}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(item.createdAt).toLocaleDateString()} at{" "}
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                      Score
                    </p>
                    <p className="text-2xl font-black text-white">
                      {item.feedback.score}%
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
