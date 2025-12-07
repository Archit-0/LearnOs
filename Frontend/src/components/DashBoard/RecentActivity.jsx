// src/components/dashboard/RecentActivity.jsx
import React from "react";
import { Activity, BarChart3, Calendar, Clock } from "lucide-react";
import GlassCard from "./GlassCard";
import { formatTime } from "./dashboardUtils";

export default function RecentActivity({ stats }) {
  const {
    averageScore = 0,
    streakDays = 0,
    totalTimeSpent = 0,
    lastActiveDate,
  } = stats || {};

  const lastActive = lastActiveDate
    ? new Date(lastActiveDate).toLocaleDateString()
    : "N/A";

  return (
    <GlassCard className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mr-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="text-sm text-gray-400">Last active: {lastActive}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
          <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{averageScore}%</div>
          <div className="text-xs text-gray-400">Performance</div>
        </div>
        <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
          <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{streakDays}</div>
          <div className="text-xs text-gray-400">Days Streak</div>
        </div>
        <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
          <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {formatTime(totalTimeSpent)}
          </div>
          <div className="text-xs text-gray-400">Total Time</div>
        </div>
      </div>
    </GlassCard>
  );
}
