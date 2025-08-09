"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Progress } from "../ui/Progress"
import { Cpu, MemoryStick, HardDrive, Monitor } from 'lucide-react'

export default function MultiprogrammedBatch({ isRunning }) {
  const [processes, setProcesses] = useState([
    { id: 1, name: "Process A", duration: 100, progress: 0, status: 'ready', color: 'bg-blue-500', memoryUsage: 25 },
    { id: 2, name: "Process B", duration: 150, progress: 0, status: 'ready', color: 'bg-green-500', memoryUsage: 35 },
    { id: 3, name: "Process C", duration: 80, progress: 0, status: 'ready', color: 'bg-purple-500', memoryUsage: 20 },
    { id: 4, name: "Process D", duration: 120, progress: 0, status: 'ready', color: 'bg-red-500', memoryUsage: 20 },
  ])
  const [cpuUtilization, setCpuUtilization] = useState(0)
  const [memoryUtilization, setMemoryUtilization] = useState(0)

  useEffect(() => {
    if (!isRunning) {
      setProcesses(prev => prev.map(p => ({ ...p, progress: 0, status: 'ready' })))
      setCpuUtilization(0)
      setMemoryUtilization(0)
      return
    }

    const interval = setInterval(() => {
      setProcesses(prevProcesses => {
        const newProcesses = [...prevProcesses]
        const readyProcesses = newProcesses.filter(p => p.status === 'ready' || p.status === 'running')

        // Simulate multiprogramming - multiple processes can be in memory
        readyProcesses.forEach((process, index) => {
          if (process.progress < 100) {
            // Simulate CPU scheduling (round-robin style)
            if (index < 2) { // Two processes can run simultaneously
              process.status = 'running'
              process.progress += Math.random() * 3 + 1 // Variable speed
            } else {
              process.status = 'ready'
            }

            if (process.progress >= 100) {
              process.progress = 100
              process.status = 'completed'
            }
          }
        })

        return newProcesses
      })

      // Update system metrics
      const runningProcesses = processes.filter(p => p.status === 'running').length
      const activeProcesses = processes.filter(p => p.status !== 'completed')

      setCpuUtilization(runningProcesses > 0 ? Math.min(runningProcesses * 45 + Math.random() * 20, 100) : 0)
      setMemoryUtilization(activeProcesses.reduce((sum, p) => sum + p.memoryUsage, 0))
    }, 200)

    return () => clearInterval(interval)
  }, [isRunning, processes])

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Multiprogrammed Batch System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                Multiprogrammed batch systems keep multiple jobs in memory simultaneously.
                When one job waits for I/O, the CPU switches to another job, improving efficiency.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">Advantages:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Better CPU utilization</li>
                  <li>• Higher system throughput</li>
                  <li>• Reduced idle time</li>
                  <li>• Multiple jobs in memory</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-400">Key Concepts:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Memory partitioning</li>
                  <li>• Job scheduling</li>
                  <li>• Context switching</li>
                  <li>• I/O management</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              CPU Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(cpuUtilization)}%</div>
            <Progress value={cpuUtilization} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MemoryStick className="w-5 h-5 text-green-400" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(memoryUtilization)}%</div>
            <Progress value={memoryUtilization} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-purple-400" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {processes.filter(p => p.status !== 'completed').length}/{processes.length}
            </div>
            <div className="text-sm text-gray-400">In memory</div>
          </CardContent>
        </Card>
      </div>

      {/* Process Visualization */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Process Execution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processes.map((process) => (
              <div key={process.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${process.color}`} />
                    <span className="font-medium text-white">{process.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${process.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : process.status === 'running'
                          ? 'bg-blue-500 text-white'
                          : process.status === 'ready'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-gray-500 text-white'
                      }`}>
                      {process.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {Math.round(process.progress)}% | Mem: {process.memoryUsage}%
                  </span>
                </div>
                <Progress value={process.progress} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Memory Layout */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Memory Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-gray-700 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full flex flex-col">
              <div className="bg-gray-600 text-white text-xs p-1 border-b border-gray-500">OS Kernel</div>
              {processes
                .filter(p => p.status !== 'completed')
                .map((process) => (
                  <div
                    key={process.id}
                    className={`${process.color} text-white text-xs p-2 border-b border-gray-400 flex items-center justify-center transition-all duration-500`}
                    style={{ height: `${process.memoryUsage}%` }}
                  >
                    {process.name}
                  </div>
                ))}
              <div className="bg-gray-500 text-gray-300 text-xs p-1 flex-1 flex items-center justify-center">
                Free Memory
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
