import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Destructure the report
  const { report } = location.state || {};

  // 2. Safety Check: If someone refreshes or visits /results directly,
  // send them back to the dashboard so the app doesn't crash on 'report.score'
  useEffect(() => {
    if (!report) {
      navigate("/dashboard");
    }
  }, [report, navigate]);
  if (!report) return <div>No report found.</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-8">
        Your Interview Report
      </h1>
      <div className="max-w-3xl mx-auto bg-gray-900 border border-blue-500/30 p-8 rounded-3xl">
        <div className="text-6xl font-black text-blue-500 text-center mb-6">
          {report.score}%
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">
              Strengths
            </h3>
            <ul className="list-disc pl-5 text-gray-300">
              {report.strengths?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm">
              Areas for Improvement
            </h3>
            <ul className="list-disc pl-5 text-gray-300">
              {report.weaknesses?.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-800">
            <p className="text-gray-400 italic">"{report.summary}"</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/history")}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold"
        >
          View All Past Interviews
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
