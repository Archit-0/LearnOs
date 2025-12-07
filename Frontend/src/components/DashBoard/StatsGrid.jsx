// src/components/dashboard/StatsGrid.jsx
import React from "react";
import {
  Trophy,
  Flame,
  Target,
  Activity,
  Timer,
  BookOpen,
  Zap,
} from "lucide-react";
import GlassCard from "./GlassCard";
import { getScoreGradient, getStreakColor, formatTime } from "./dashboardUtils";

export default function StatsGrid({ stats }) {
  const {
    averageScore = 0,
    streakDays = 0,
    totalQuizzesTaken = 0,
    totalTimeSpent = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Average Score */}
      <GlassCard className="p-6 hover:border-purple-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${getScoreGradient(
              averageScore
            )}`}
          >
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{averageScore}%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Average Score
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(
              averageScore
            )} transition-all duration-1000`}
            style={{ width: `${averageScore}%` }}
          ></div>
        </div>
      </GlassCard>

      {/* Streak Days */}
      <GlassCard className="p-6 hover:border-orange-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 group">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getStreakColor(streakDays)}`}>
              {streakDays}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Day Streak
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-300">
          <Zap className="w-4 h-4 mr-2 text-yellow-400" />
          Keep it going!
        </div>
      </GlassCard>

      {/* Total Quizzes */}
      <GlassCard className="p-6 hover:border-blue-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 group">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {totalQuizzesTaken}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Quizzes Taken
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-300">
          <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
          Knowledge gained
        </div>
      </GlassCard>

      {/* Time Spent */}
      <GlassCard className="p-6 hover:border-green-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 group">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatTime(totalTimeSpent)}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Time Invested
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-300">
          <Activity className="w-4 h-4 mr-2 text-green-400" />
          Learning time
        </div>
      </GlassCard>
    </div>
  );
}
