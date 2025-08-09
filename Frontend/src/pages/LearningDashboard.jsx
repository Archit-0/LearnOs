import React, { useState, useEffect } from 'react';
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
  Trophy
} from 'lucide-react';
import apiService from '../Api/api';

const LearningDashboard = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [preferences, setPreferences] = useState({
    difficulty: 'intermediate',
    learningStyle: 'visual',
    voiceEnabled: false
  });

  // Mock API service calls - replace with your actual apiServices
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      // Replace with: await apiServices.getRecommendations();
      const mockData = await apiService.getLearningPathRecommendations()
      setRecommendations(mockData);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      await apiService.updatePreferences(newPreferences);
      setPreferences({ ...preferences, ...newPreferences });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return <Star className="w-4 h-4 text-green-500" />;
      case 'intermediate': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'advanced': return <Trophy className="w-4 h-4 text-red-500" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const ModuleCard = ({ recommendation, showProgress = true }) => {
    const { module, reasons, currentProgress, priority } = recommendation;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getDifficultyIcon(module.difficulty)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{module.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {module.estimatedTime} min
                </span>
                <span className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {module.category}
                </span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
            {priority}
          </span>
        </div>

        {showProgress && currentProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Progress</span>
              <span className="text-xs text-gray-500">{currentProgress.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentProgress.completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Why recommended:</h4>
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                {reason}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2">
          {currentProgress?.status === 'in-progress' ? (
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

  const StudyPlanCard = ({ plan }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
        Your Study Plan
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            This Week
          </h4>
          {plan.thisWeek.length > 0 ? (
            <div className="space-y-2">
              {plan.thisWeek.map((item, index) => (
                <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.module.title}</span>
                    <span className="text-sm text-green-600 font-medium">{item.day}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.suggestedTime} minutes
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No modules scheduled for this week</p>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Next Week
          </h4>
          {plan.nextWeek.length > 0 ? (
            <div className="space-y-2">
              {plan.nextWeek.map((item, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.module.title}</span>
                    <span className="text-sm text-blue-600 font-medium">{item.day}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.suggestedTime} minutes
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No modules scheduled for next week</p>
          )}
        </div>
      </div>
    </div>
  );

  const InsightsCard = ({ insights }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
        Learning Insights
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Overall Progress</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-medium text-gray-900">{insights.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${insights.completionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className="font-medium text-gray-900">{insights.averageScore}%</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">Category Performance</h4>
          <div className="space-y-2">
            {Object.entries(insights.categoryPerformance).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${data.average}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10">{Math.round(data.average)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {insights.weakAreas.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
            Areas for Improvement
          </h4>
          <div className="flex flex-wrap gap-2">
            {insights.weakAreas.map((area, index) => (
              <span key={index} className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full border border-orange-200">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const PreferencesCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-blue-500" />
        Learning Preferences
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-3">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => updatePreferences({ difficulty: level })}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${preferences.difficulty === level
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Learning Style</label>
          <div className="grid grid-cols-2 gap-3">
            {['visual', 'practical'].map((style) => (
              <button
                key={style}
                onClick={() => updatePreferences({ learningStyle: style })}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${preferences.learningStyle === style
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Voice Guidance</span>
          <button
            onClick={() => updatePreferences({ voiceEnabled: !preferences.voiceEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.voiceEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Learning Dashboard</h1>
                <p className="text-sm text-gray-600">Personalized recommendations for your journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {recommendations?.insights.completionRate}% Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'recommendations', label: 'Recommendations', icon: Target },
              { id: 'study-plan', label: 'Study Plan', icon: Calendar },
              { id: 'insights', label: 'Insights', icon: BarChart3 },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            {/* High Priority */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                High Priority
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.recommendations.highPriority.map((rec, index) => (
                  <ModuleCard key={index} recommendation={rec} />
                ))}
              </div>
            </div>

            {/* Medium Priority */}
            {recommendations.recommendations.mediumPriority.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-yellow-500" />
                  Medium Priority
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recommendations.recommendations.mediumPriority.map((rec, index) => (
                    <ModuleCard key={index} recommendation={rec} />
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority */}
            {recommendations.recommendations.lowPriority.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Additional Recommendations
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recommendations.recommendations.lowPriority.map((rec, index) => (
                    <ModuleCard key={index} recommendation={rec} showProgress={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'study-plan' && (
          <StudyPlanCard plan={recommendations.studyPlan} />
        )}

        {activeTab === 'insights' && (
          <InsightsCard insights={recommendations.insights} />
        )}

        {activeTab === 'preferences' && (
          <PreferencesCard />
        )}
      </div>
    </div>
  );
};

export default LearningDashboard;