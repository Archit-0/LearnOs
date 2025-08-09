import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import {
  Monitor,
  Clock,
  Layers,
  Users,
  Network,
  Globe,
  Zap,
  Settings,
  Play,
  Pause,
  RotateCcw,
  PcCase as Pc
} from "lucide-react";

// Import your topic components
import OSIntroduction from "./common/OsIntroduction";
import SimpleBatchSystem from "./common/SimpleBatchSystem"
import MultiprogrammedBatch from "./common/MultiprogrammedBatch";
import TimeSharingSystem from "./common/TimeSharingSystem";
import PersonalComputerSystem from "./common/PersonalComputerSystem";
import ParallelSystem from "./common/ParallelSystem";
import DistributedSystem from "./common/DistributedSystem";
import RealTimeSystem from "./common/RealTimeSystem";
import ResourceManager from "./common/ResourceManager";

const topics = [
  { id: "intro", name: "OS Introduction", icon: Monitor, description: "What is an Operating System?" },
  { id: "simple-batch", name: "Simple Batch", icon: Layers, description: "Sequential job processing" },
  { id: "multiprogrammed", name: "Multiprogrammed Batch", icon: Settings, description: "Multiple programs in memory" },
  { id: "time-sharing", name: "Time Sharing", icon: Clock, description: "CPU time slicing among users" },
  { id: "personal", name: "Personal Computer", icon: Pc, description: "Single-user systems" },
  { id: "parallel", name: "Parallel Systems", icon: Network, description: "Multiple CPUs working together" },
  { id: "distributed", name: "Distributed Systems", icon: Globe, description: "Network-connected computers" },
  { id: "real-time", name: "Real-Time Systems", icon: Zap, description: "Time-critical processing" },
  { id: "resource", name: "Resource Manager", icon: Users, description: "OS as a resource manager" }
];

export default function OSSimulation() {
  const [activeTopic, setActiveTopic] = useState("intro");
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const renderTopicContent = () => {
    switch (activeTopic) {
      case "intro": return <OSIntroduction isRunning={isSimulationRunning} />;
      case "simple-batch": return <SimpleBatchSystem isRunning={isSimulationRunning} />;
      case "multiprogrammed": return <MultiprogrammedBatch isRunning={isSimulationRunning} />;
      case "time-sharing": return <TimeSharingSystem isRunning={isSimulationRunning} />;
      case "personal": return <PersonalComputerSystem isRunning={isSimulationRunning} />;
      case "parallel": return <ParallelSystem isRunning={isSimulationRunning} />;
      case "distributed": return <DistributedSystem isRunning={isSimulationRunning} />;
      case "real-time": return <RealTimeSystem isRunning={isSimulationRunning} />;
      case "resource": return <ResourceManager isRunning={isSimulationRunning} />;
      default: return <OSIntroduction isRunning={isSimulationRunning} />;
    }
  };

  const currentTopic = topics.find(t => t.id === activeTopic);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-blue-400">Operating Systems Simulation</h1>
          <p className="text-gray-300 text-lg">Interactive learning tool for OS concepts and systems</p>
        </div>

        {/* Topic Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                variant={activeTopic === topic.id ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${activeTopic === topic.id
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600"
                  }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{topic.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Current Topic Header */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentTopic && <currentTopic.icon className="w-8 h-8 text-blue-400" />}
                <div>
                  <CardTitle className="text-2xl text-blue-400">{currentTopic?.name}</CardTitle>
                  <p className="text-gray-400 mt-1">{currentTopic?.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isSimulationRunning ? "default" : "secondary"} className="px-3 py-1">
                  {isSimulationRunning ? "Running" : "Stopped"}
                </Badge>
                <Button
                  onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSimulationRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setIsSimulationRunning(false)}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Topic Content */}
        <div className="min-h-96">
          {renderTopicContent()}
        </div>
      </div>
    </div>
  );
}
