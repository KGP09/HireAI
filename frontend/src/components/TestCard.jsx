import { useAIStore } from "../store/useAIStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const roundRouteMap = {
  "Aptitude Round": "/aptitude/:index",
  "Telephonic Round": "/telephonic",
  "DSA Round": "/dsa",
  "Technical Round": "/technical-interview",
  "HR Round": "/hr",
};

const TestCard = ({ id }) => {
  const { tests, getTests, isLoadingRounds } = useAIStore();

  useEffect(() => {
    if (id) getTests(id);
  }, [id, getTests]);

  if (isLoadingRounds) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
      </div>
    );
  }

  if (!tests.length) {
    return (
      <div className="text-center text-gray-500 mt-10">No tests found.</div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {tests.map((test, index) => (
        <div
          key={index}
          className="card bg-base-100 shadow-md border border-base-200"
        >
          <div className="card-body">
            <h2 className="card-title text-primary">{test.testName}</h2>

            <p className="text-sm text-gray-500">
              Total Rounds: {test.numberOfRounds}
            </p>

            <div className="divider my-2" />

            {test.rounds?.map((round, rIndex) => {
              // 1. Get the base route from the map
              let route = roundRouteMap[round.roundType];

              // 2. Replace the placeholder with the real round index
              if (route && route.includes(":index")) {
                route = route.replace(":index", rIndex);
              }

              return (
                <div
                  key={rIndex}
                  className="p-4 rounded-lg border border-base-300 bg-base-50"
                >
                  {/* Round Title */}
                  <h3 className="font-semibold text-accent mb-1">
                    {round.roundType}
                  </h3>

                  {/* Description */}
                  <p className="text-sm italic text-gray-500 mb-3">
                    {round.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Take Test */}
                    {!round.status && route && (
                      <Link
                        to={route}
                        state={{ test, index, round, rIndex }}
                        className="btn btn-primary btn-sm"
                      >
                        Take Test
                      </Link>
                    )}

                    {/* Score (Scorable rounds) */}
                    {round.status && round.isScorable && (
                      <span className="text-sm font-semibold text-success">
                        Score: {round.score}
                      </span>
                    )}

                    {/* Feedback (Non-scorable rounds) */}
                    {round.status && !round.isScorable && (
                      <span className="text-sm font-semibold text-info">
                        Feedback submitted
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`badge ${
                        round.status ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {round.status ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestCard;
