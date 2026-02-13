import TestCard from "./TestCard";
import { useAuthStore } from "../store/useAuthStore";
import { Outlet, useLocation } from "react-router-dom";

const Practise = () => {
  const { authUser } = useAuthStore();
  const location = useLocation();
  const id = authUser?._id;

  const isBasePracticeRoute =
    location.pathname === "/practice" || location.pathname === "/practice/";

  return (
    <div className="min-h-screen p-6">
      {isBasePracticeRoute ? (
        <>
          <h1 className="text-2xl font-bold mb-4 text-center">Your Tests</h1>
          <TestCard id={id} />
        </>
      ) : (
        /* This renders when you are at /practice/aptitude */
        <Outlet />
      )}
    </div>
  );
};

export default Practise;
