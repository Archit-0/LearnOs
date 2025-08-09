import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Award,
  Flame,
  Star,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Brain,
  BookOpen,
  ChevronRight,
  Settings,
  Crown,
  Sparkles,
  Medal,
  Timer
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStreakColor = (days) => {
    if (days >= 30) return 'text-purple-400';
    if (days >= 14) return 'text-blue-400';
    if (days >= 7) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-purple-500 to-pink-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-green-500 to-emerald-500';
    return 'from-yellow-500 to-orange-500';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {getGreeting()}, {user.name}
              </h1>
              <p className="text-gray-400 text-lg flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                {user.role} • {currentTime.toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl px-6 py-4 border border-gray-700/50">
                <div className="text-2xl font-mono font-bold text-white">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-gray-400">Local Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Score */}
          <div className="group">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${getScoreGradient(user.stats.averageScore)}`}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{user.stats.averageScore}%</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Average Score</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(user.stats.averageScore)} transition-all duration-1000`}
                  style={{ width: `${user.stats.averageScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Streak Days */}
          <div className="group">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getStreakColor(user.stats.streakDays)}`}>
                    {user.stats.streakDays}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Day Streak</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                Keep it going!
              </div>
            </div>
          </div>

          {/* Total Quizzes */}
          <div className="group">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{user.stats.totalQuizzesTaken}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Quizzes Taken</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                Knowledge gained
              </div>
            </div>
          </div>

          {/* Time Spent */}
          <div className="group">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{formatTime(user.stats.totalTimeSpent)}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Time Invested</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Activity className="w-4 h-4 mr-2 text-green-400" />
                Learning time
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 mb-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-sm text-gray-400 uppercase tracking-wide mb-1 block">Email Address</label>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 group-hover:border-purple-500/50 transition-colors">
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-sm text-gray-400 uppercase tracking-wide mb-1 block">Difficulty Level</label>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 group-hover:border-purple-500/50 transition-colors">
                      <div className="flex items-center">
                        {user.preferences.difficulty === 'beginner' && <Star className="w-5 h-5 text-green-400 mr-2" />}
                        {user.preferences.difficulty === 'intermediate' && <Target className="w-5 h-5 text-yellow-400 mr-2" />}
                        {user.preferences.difficulty === 'advanced' && <Crown className="w-5 h-5 text-purple-400 mr-2" />}
                        <p className="text-white font-medium capitalize">{user.preferences.difficulty}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="text-sm text-gray-400 uppercase tracking-wide mb-1 block">Learning Style</label>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 group-hover:border-purple-500/50 transition-colors">
                      <div className="flex items-center">
                        <Brain className="w-5 h-5 text-blue-400 mr-2" />
                        <p className="text-white font-medium capitalize">{user.preferences.learningStyle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-sm text-gray-400 uppercase tracking-wide mb-1 block">Voice Guidance</label>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 group-hover:border-purple-500/50 transition-colors">
                      <div className="flex items-center">
                        {user.preferences.voiceEnabled ? (
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
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mr-4">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                </div>
                <div className="text-sm text-gray-400">
                  Last active: {new Date(user.stats.lastActiveDate).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                  <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{user.stats.averageScore}%</div>
                  <div className="text-xs text-gray-400">Performance</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                  <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{user.stats.streakDays}</div>
                  <div className="text-xs text-gray-400">Days Streak</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{formatTime(user.stats.totalTimeSpent)}</div>
                  <div className="text-xs text-gray-400">Total Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Sidebar */}
          <div className="space-y-8">
            {/* Achievements */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mr-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Achievements</h2>
              </div>

              {user.achievements && user.achievements.length > 0 ? (
                <div className="space-y-3">
                  {user.achievements.map((achievement, idx) => (
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
                  <p className="text-sm text-gray-500">Keep learning to unlock your first achievement!</p>
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium">
                      Start Learning
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-purple-500/50 transition-all duration-200 group">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-purple-400 mr-3" />

                    <span onClick={() => navigate('/quizzes')} className="text-white">Take a Quiz</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-blue-500/50 transition-all duration-200 group">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-400 mr-3" />
                    <span className="text-white">Continue Learning</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-green-500/50 transition-all duration-200 group">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-white">View Progress</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}