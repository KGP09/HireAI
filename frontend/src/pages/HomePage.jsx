import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { MessageCircle, Calendar, Settings, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAIStore } from "../store/useAIStore";
export default function HomePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/create"
          className="card bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-primary/30"
        >
          <div className="card-body items-center text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="card-title text-primary">Create Test</h2>
            <p className="text-sm">Generate AI interview rounds</p>
          </div>
        </Link>

        <Link
          to="/interviews"
          className="card bg-base-100 shadow-xl hover:bg-primary/10 transition"
        >
          <div className="card-body items-center text-center">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h2 className="card-title">Start Interview</h2>
            <p className="text-sm">View mock interviews assigned to you</p>
          </div>
        </Link>

        <Link
          to="/practice" 
          className="card bg-base-100 shadow-xl hover:bg-primary/10 transition"
        >
          <div className="card-body items-center text-center">
            <Calendar className="h-8 w-8 text-primary" />
            <h2 className="card-title">Practice</h2>
            <p className="text-sm">View your generated tests</p>
          </div>
        </Link>

        <Link
          to="/settings"
          className="card bg-base-100 shadow-xl hover:bg-primary/10 transition"
        >
          <div className="card-body items-center text-center">
            <Settings className="h-8 w-8 text-primary" />
            <h2 className="card-title">Settings</h2>
            <p className="text-sm">Manage your profile</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
