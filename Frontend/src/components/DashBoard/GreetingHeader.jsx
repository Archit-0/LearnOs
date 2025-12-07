import { Crown } from "lucide-react";
import { getGreeting } from "./dashboardUtils";

export default function GreetingHeader({ user, currentTime }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {getGreeting(currentTime)}, {user?.name}
          </h1>
          <p className="text-gray-400 text-lg flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-400" />
            {user?.role || "Learner"} • {currentTime.toLocaleDateString()}
          </p>
        </div>

        <div className="text-right">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl px-6 py-4 border border-gray-700/50">
            <div className="text-2xl font-mono font-bold text-white">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-sm text-gray-400">Local Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
