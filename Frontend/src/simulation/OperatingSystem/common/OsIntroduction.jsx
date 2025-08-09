import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Progress } from "../ui/Progress"
import { Monitor, HardDrive, Cpu, MemoryStick, Network } from "lucide-react"

export default function OSIntroduction({ isRunning }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      title: "Hardware Layer",
      description: "CPU, Memory, Storage, I/O Devices",
      icon: Cpu,
      color: "text-red-400"
    },
    {
      title: "Operating System",
      description: "Kernel, Device Drivers, System Services",
      icon: Monitor,
      color: "text-blue-400"
    },
    {
      title: "System Software",
      description: "Compilers, Utilities, Libraries",
      icon: HardDrive,
      color: "text-green-400"
    },
    {
      title: "Application Software",
      description: "User Programs, Games, Browsers",
      icon: MemoryStick,
      color: "text-purple-400"
    },
    {
      title: "User Interface",
      description: "GUI, Command Line, Touch Interface",
      icon: Network,
      color: "text-yellow-400"
    }
  ]

  useEffect(() => {
    if (!isRunning) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentStep(current => (current + 1) % steps.length)
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, steps.length])

  return (
    <div className="space-y-6">
      {/* Main Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">
            What is an Operating System?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            An Operating System (OS) is a software program that acts as an intermediary between
            computer hardware and user applications. It manages system resources, provides services
            to applications, and creates an interface for users to interact with the computer.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Key Functions:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Process Management</li>
                <li>• Memory Management</li>
                <li>• File System Management</li>
                <li>• Device Management</li>
                <li>• Security & Access Control</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Types of OS:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Batch Operating Systems</li>
                <li>• Time-sharing Systems</li>
                <li>• Distributed Systems</li>
                <li>• Real-time Systems</li>
                <li>• Mobile Operating Systems</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layered Architecture Visualization */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Computer System Layers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === index
              const isCompleted = isRunning && (currentStep > index || (currentStep === index && progress > 0))

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all duration-500 ${isActive && isRunning
                    ? 'border-blue-500 bg-gray-700 scale-105'
                    : isCompleted
                      ? 'border-green-500 bg-gray-750'
                      : 'border-gray-600 bg-gray-800'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-8 h-8 ${step.color} ${isActive && isRunning ? 'animate-pulse' : ''}`} />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${step.color}`}>{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.description}</p>
                      {isActive && isRunning && (
                        <Progress value={progress} className="mt-2 h-2" />
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-500'
                      }`} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
