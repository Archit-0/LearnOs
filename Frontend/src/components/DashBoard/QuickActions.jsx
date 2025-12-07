import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import GreetingHeader from "./GreetingHeader";
import StatsGrid from "./StatsGrid";
import ProfileCard from "./ProfileCard";
import RecentActivity from "./RecentActivity";
import Achievements from "./Achievements";
import QuickActions from "./QuickActions";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Safe fallbacks
  const stats = user.stats || {
    averageScore: 0,
    streakDays: 0,
    totalQuizzesTaken: 0,
    totalTimeSpent: 0,
    lastActiveDate: new Date().toISOString(),
  };

  const preferences = user.preferences || {
    difficulty: "beginner",
    learningStyle: "visual",
    voiceEnabled: false,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GreetingHeader user={user} currentTime={currentTime} />
        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile + Activity */}
          <div className="lg:col-span-2">
            <ProfileCard user={user} preferences={preferences} />
            <RecentActivity stats={stats} />
          </div>

          {/* Right: Achievements + Quick Actions */}
          <div className="space-y-8">
            <Achievements achievements={user.achievements} />
            <QuickActions navigate={navigate} />
          </div>
        </div>
      </div>
    </div>
  );
}
