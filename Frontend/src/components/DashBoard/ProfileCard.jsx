// src/components/dashboard/ProfileCard.jsx
import React from "react";
import { User, Target, Star, Crown, Brain } from "lucide-react";
import GlassCard from "./GlassCard";

export default function ProfileCard({ user, preferences }) {
  const { email } = user || {};
  const { difficulty, learningStyle, voiceEnabled } = preferences || {};

  const renderDifficultyIcon = () => {
    if (difficulty === "beginner")
      return <Star className="w-5 h-5 text-green-400 mr-2" />;
    if (difficulty === "intermediate")
      return <Target className="w-5 h-5 text-yellow-400 mr-2" />;
    if (difficulty === "advanced")
      return <Crown className="w-5 h-5 text-purple-400 mr-2" />;

    return <Star className="w-5 h-5 text-gray-400 mr-2" />;
  };

  return (
    <GlassCard className="p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Profile Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Email */}
          <div className="group">
            <label className="text-sm text-gray-400 uppercase tracking-wide mb-1 block">
              Email Address
            </label>
            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 group-hover:border-purple-500/50 transition-colors">
              <p className="text-white font-medium">{email}</p>
            </div>
          </div>

          {/* Difficulty */}
          <div className="group">
            <label className="text-sm text-gray-400 uppercase tracking-wide mb-1 block">
              Difficulty Level
            </label>
            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 group-hover:border-purple-500/50 transition-colors">
              <div className="flex items-center">
                {renderDifficultyIcon()}
                <p className="text-white font-medium capitalize">
                  {difficulty || "not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Learning Style */}
          <div className="group">
            <label className="text-sm text-gray-400 uppercase tracking-wide mb-1 block">
              Learning Style
            </label>
            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 group-hover:border-purple-500/50 transition-colors">
              <div className="flex items-center">
                <Brain className="w-5 h-5 text-blue-400 mr-2" />
                <p className="text-white font-medium capitalize">
                  {learningStyle || "not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Voice Guidance */}
          <div className="group">
            <label className="text-sm text-gray-400 uppercase tracking-wide mb-1 block">
              Voice Guidance
            </label>
            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 group-hover:border-purple-500/50 transition-colors">
              <div className="flex items-center">
                {voiceEnabled ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                    <p className="text-green-400 font-medium">Enabled</p>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                    <p className="text-gray-400 font-medium">Disabled</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
