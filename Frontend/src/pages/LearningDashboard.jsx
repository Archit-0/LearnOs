import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Settings,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Calendar,
  Brain,
  Star,
  ChevronRight,
  User,
  Trophy,
} from "lucide-react";
import apiService from "../Api/api";

const LearningDashboard = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const getModuleSlug = (title) => {
    return title?.toLowerCase().replace(/\s+/g, "-");
  };

  const [preferences, setPreferences] = useState({
    difficulty: "intermediate",
    learningStyle: "visual",
    voiceEnabled: false,
  });

  // ============ Fetch Recommendations ============
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.getLearningPathRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Unable to load your learning dashboard right now.");
    } finally {
      setLoading(false);
    }
  };

  // ============ Update Preferences ============
  const updatePreferences = async (newPreferences) => {
    try {
      await apiService.updatePreferences(newPreferences);
      setPreferences((prev) => ({ ...prev, ...newPreferences }));
    } catch (err) {
      console.error("Error updating preferences:", err);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // ============ Helpers ============

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return <Star className="w-4 h-4 text-green-500" />;
      case "intermediate":
        return <Target className="w-4 h-4 text-yellow-500" />;
      case "advanced":
        return <Trophy className="w-4 h-4 text-red-500" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // ============ Module Card Component ============
  const ModuleCard = ({ recommendation, showProgress = true }) => {
    if (!recommendation) return null;

    const module = recommendation.module ?? {};
    const reasons = recommendation.reasons ?? [];
    const currentProgress = recommendation.currentProgress ?? null;
    const priority = recommendation.priority ?? "medium";

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getDifficultyIcon(module?.difficulty)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {module?.title ?? "Untitled Module"}
              </h3>

              <p className="text-sm text-gray-600 mb-2">
                {module?.description ?? "No description available."}
              </p>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {module?.estimatedTime ?? 0} min
                </span>

                <span className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {module?.category ?? "General"}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
              priority
            )}`}
          >
            {priority}
          </span>
        </div>

        {/* Progress Bar */}
        {showProgress && currentProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                Progress
              </span>
              <span className="text-xs text-gray-500">
                {currentProgress?.completionPercentage ?? 0}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${currentProgress?.completionPercentage ?? 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Recommendation Reasons */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            Why recommended:
          </h4>
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => {
            const slug = getModuleSlug(module?.title);
            navigate(`/simulation/${slug}`);
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {currentProgress?.status === "in-progress" ? (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>Continue Learning</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              <span>Start Module</span>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // ============ Loading State ============

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your personalized learning path...
          </p>
        </div>
      </div>
    );
  }

  // ============ Error State ============

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-md border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prevent crash if API returns unexpectedly
  const reco = recommendations?.recommendations ?? {};
  const insights = recommendations?.insights ?? {};
  const studyPlan = recommendations?.studyPlan ?? {
    thisWeek: [],
    nextWeek: [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Learning Dashboard</h1>
              <p className="text-sm text-gray-600">
                Your personalized learning journey
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {insights?.completionRate ?? 0}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex space-x-8">
          {[
            { id: "recommendations", label: "Recommendations", icon: Target },
            { id: "study-plan", label: "Study Plan", icon: Calendar },
            { id: "insights", label: "Insights", icon: BarChart3 },
            { id: "preferences", label: "Preferences", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 flex items-center space-x-2 border-b-2 text-sm transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* =================== RECOMMENDATIONS =================== */}
        {activeTab === "recommendations" && (
          <div className="space-y-10">
            {/* High Priority */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                High Priority
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(reco.highPriority ?? []).map((rec, i) => (
                  <ModuleCard key={i} recommendation={rec} />
                ))}
              </div>
            </section>

            {/* Medium Priority */}
            {(reco.mediumPriority ?? []).length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-yellow-500" />
                  Medium Priority
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {(reco.mediumPriority ?? []).map((rec, i) => (
                    <ModuleCard key={i} recommendation={rec} />
                  ))}
                </div>
              </section>
            )}

            {/* Low Priority */}
            {(reco.lowPriority ?? []).length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Additional Recommendations
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {(reco.lowPriority ?? []).map((rec, i) => (
                    <ModuleCard
                      key={i}
                      recommendation={rec}
                      showProgress={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* =================== STUDY PLAN =================== */}
        {activeTab === "study-plan" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Your Study Plan
            </h3>

            {/* THIS WEEK */}
            <section className="mb-8">
              <h4 className="font-medium text-gray-800 mb-3">This Week</h4>

              {(studyPlan.thisWeek ?? []).length > 0 ? (
                <div className="space-y-3">
                  {studyPlan.thisWeek.map((item, i) => (
                    <div
                      key={i}
                      className="bg-green-50 border border-green-200 p-4 rounded-lg"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {item.module?.title}
                        </span>
                        <span className="text-green-600">{item.day}</span>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.suggestedTime} minutes
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No modules scheduled this week.
                </p>
              )}
            </section>

            {/* NEXT WEEK */}
            <section>
              <h4 className="font-medium text-gray-800 mb-3">Next Week</h4>

              {(studyPlan.nextWeek ?? []).length > 0 ? (
                <div className="space-y-3">
                  {studyPlan.nextWeek.map((item, i) => (
                    <div
                      key={i}
                      className="bg-blue-50 border border-blue-200 p-4 rounded-lg"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {item.module?.title}
                        </span>
                        <span className="text-blue-600">{item.day}</span>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.suggestedTime} minutes
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No modules scheduled next week.
                </p>
              )}
            </section>
          </div>
        )}

        {/* =================== INSIGHTS =================== */}
        {activeTab === "insights" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Learning Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Overall Progress
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Completion Rate
                    </span>
                    <span className="font-medium">
                      {insights?.completionRate ?? 0}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${insights?.completionRate ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Performance */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Category Performance
                </h4>

                <div className="space-y-2">
                  {Object.entries(insights?.categoryPerformance ?? {}).map(
                    ([category, data]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-sm text-gray-600">
                          {category}
                        </span>

                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 h-1.5 rounded-full">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${data?.average ?? 0}%` }}
                            />
                          </div>
                          <span className="font-medium text-sm w-10">
                            {Math.round(data?.average ?? 0)}%
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Weak Areas */}
            {(insights?.weakAreas ?? []).length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                  Areas for Improvement
                </h4>

                <div className="flex flex-wrap gap-2">
                  {insights.weakAreas.map((area, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full border border-orange-200"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== PREFERENCES =================== */}
        {activeTab === "preferences" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-500" />
              Learning Preferences
            </h3>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Difficulty Level
              </label>

              <div className="grid grid-cols-3 gap-3">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => updatePreferences({ difficulty: level })}
                    className={`py-2 px-4 rounded-lg text-sm ${
                      preferences.difficulty === level
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning style */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Learning Style
              </label>

              <div className="grid grid-cols-2 gap-3">
                {["visual", "practical"].map((style) => (
                  <button
                    key={style}
                    onClick={() => updatePreferences({ learningStyle: style })}
                    className={`py-2 px-4 rounded-lg text-sm ${
                      preferences.learningStyle === style
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {style.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Voice Guidance</span>

              <button
                onClick={() =>
                  updatePreferences({ voiceEnabled: !preferences.voiceEnabled })
                }
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                  preferences.voiceEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 bg-white rounded-full transform transition-transform ${
                    preferences.voiceEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningDashboard;
