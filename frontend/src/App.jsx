import React, { useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Loader } from "lucide-react";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./store/useAuthStore";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PromtComponent from "./components/PromtComponent";
import Practise from "./components/Practise";
import Explore from "./components/Explore";
import Profile from "./components/Profile";
import Aptitude from "./pages/Aptitude";
import InterviewPage from "./pages/InterviewPage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";

const queryClient = new QueryClient();

// Temporary mock - replace with your useAuthStore
// const useAuthStore = () => ({
//   checkAuth: () => {},
//   authUser: true, // Set to true to bypass auth for now
//   isCheckingAuth: false,
// });

const App = () => {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                authUser ? (
                  <Layout>
                    <Outlet />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              <Route index element={<Index />} />
              <Route path="create" element={<PromtComponent />} />
              <Route path="practice" element={<Practise />} />
              <Route path="explore" element={<Explore />} />
              <Route path="profile" element={<Profile />} />
              <Route path="aptitude/:index" element={<Aptitude />} />
              <Route path="/interviews" element={<InterviewPage />} />
              <Route
                path="/results"
                element={authUser ? <ResultsPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/history"
                element={authUser ? <HistoryPage /> : <Navigate to="/login" />}
              />
            </Route>

            <Route
              path="/signup"
              element={!authUser ? <SignupPage /> : <Navigate to="/" />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" />}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
