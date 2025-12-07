// src/components/dashboard/Achievements.jsx
import React from "react";
import { Trophy, Medal, ChevronRight, Sparkles } from "lucide-react";
import GlassCard from "./GlassCard";

export default function Achievements({ achievements }) {
  const hasAchievements = achievements && achievements.length > 0;

  return (
    <GlassCard className="p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mr-4">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Achievements</h2>
      </div>

      {hasAchievements ? (
        <div className="space-y-3">
          {achievements.map((achievement, idx) => (
            <div
              key={idx}
              className="flex items-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50 hover:border-yellow-500/50 transition-all duration-300 group"
            >
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                <Medal className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{achievement}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="p-4 bg-gray-700/30 rounded-2xl mb-4 inline-block">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <p className="text-gray-400 mb-2">No achievements yet</p>
          <p className="text-sm text-gray-500">
            Keep learning to unlock your first achievement!
          </p>
        </div>
      )}
    </GlassCard>
  );
}
