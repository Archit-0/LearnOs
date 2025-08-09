"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Progress } from "../ui/Progress"
import { Badge } from "../ui/Badge"
import { Cpu, Zap, Activity, Network } from 'lucide-react'

export default function ParallelSystem({ isRunning }) {
  const [processors, setProcessors] = useState([
    { id: 1, name: "CPU-1", load: 0, task: "", status: 'idle', color: 'bg-blue-500' },
    { id: 2, name: "CPU-2", load: 0, task: "", status: 'idle', color: 'bg-green-500' },
    { id: 3, name: "CPU-3", load: 0, task: "", status: 'idle', color: 'bg-purple-500' },
    { id: 4, name: "CPU-4", load: 0, task: "", status: 'idle', color: 'bg-red-500' },
  ])

  const [tasks, setTasks] = useState([
    { id: 1, name: "Matrix Multiplication", totalWork: 100, completedWork: 0, assignedProcessors: [], status: 'pending' },
    { id: 2, name: "Image Processing", totalWork: 80, completedWork: 0, assignedProcessors: [], status: 'pending' },
    { id: 3, name: "Data Sorting", totalWork: 60, completedWork: 0, assignedProcessors: [], status: 'pending' },
  ])

  const [systemMetrics, setSystemMetrics] = useState({
    throughput: 0,
    efficiency: 0,
    synchronizationOverhead: 0
  })

  useEffect(() => {
    if (!isRunning) {
      setProcessors(prev => prev.map(p => ({ ...p, load: 0, task: "", status: 'idle' })))
      setTasks(prev => prev.map(t => ({ ...t, completedWork: 0, assignedProcessors: [], status: 'pending' })))
      setSystemMetrics({ throughput: 0, efficiency: 0, synchronizationOverhead: 0 })
      return
    }

    const interval = setInterval(() => {
      setTasks(prevTasks => {
        const newTasks = [...prevTasks]
        const pendingTasks = newTasks.filter(t => t.status === 'pending')
        const runningTasks = newTasks.filter(t => t.status === 'running')

        // Assign tasks to idle processors
        if (pendingTasks.length > 0) {
          const idleProcessors = processors.filter(p => p.status === 'idle')
          if (idleProcessors.length > 0) {
            const task = pendingTasks[0]
            const numProcessors = Math.min(idleProcessors.length, 2) // Use up to 2 processors per task
            task.assignedProcessors = idleProcessors.slice(0, numProcessors).map(p => p.id)
            task.status = 'running'
          }
        }

        // Process running tasks
        runningTasks.forEach(task => {
          const workPerProcessor = 2 + Math.random() * 3 // Variable work speed
          task.completedWork += workPerProcessor * task.assignedProcessors.length
          
          if (task.completedWork >= task.totalWork) {
            task.completedWork = task.totalWork
            task.status = 'completed'
            task.assignedProcessors = []
          }
        })

        return newTasks
      })

      // Update processors based on task assignments
      setProcessors(prevProcessors => {
        const newProcessors = [...prevProcessors]
        
        newProcessors.forEach(processor => {
          const assignedTask = tasks.find(t => 
            t.status === 'running' && t.assignedProcessors.includes(processor.id)
          )
          
          if (assignedTask) {
            processor.status = 'busy'
            processor.task = assignedTask.name
            processor.load = 70 + Math.random() * 30
          } else {
            processor.status = 'idle'
            processor.task = ""
            processor.load = Math.random() * 10
          }

          // Simulate synchronization overhead
          if (Math.random() < 0.1) {
            processor.status = 'synchronizing'
            processor.load = 20 + Math.random() * 20
          }
        })

        return newProcessors
      })

      // Update system metrics
      const busyProcessors = processors.filter(p => p.status === 'busy').length
      const totalProcessors = processors.length
      const completedTasks = tasks.filter(t => t.status === 'completed').length
      
      setSystemMetrics({
        throughput: completedTasks * 10,
        efficiency: (busyProcessors / totalProcessors) * 100,
        synchronizationOverhead: Math.random() * 15 + 5
      })

    }, 500)

    return () => clearInterval(interval)
  }, [isRunning, processors, tasks])

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Parallel Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                Parallel systems use multiple CPUs to execute tasks simultaneously, 
                improving performance through parallel processing and load distribution.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">Types:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Symmetric Multiprocessing (SMP)</li>
                  <li>• Asymmetric Multiprocessing</li>
                  <li>• Clustered Systems</li>
                  <li>• Massively Parallel Processing</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-400">Benefits:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Increased throughput</li>
                  <li>• Better fault tolerance</li>
                  <li>• Resource sharing</li>
                  <li>• Scalable performance</li>
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
              <Zap className="w-5 h-5 text-blue-400" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.throughput)}</div>
            <div className="text-sm text-gray-400">Tasks/min</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.efficiency)}%</div>
            <Progress value={systemMetrics.efficiency} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="w-5 h-5 text-red-400" />
              Sync Overhead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.synchronizationOverhead)}%</div>
            <Progress value={systemMetrics.synchronizationOverhead} className="h-2 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Processor Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Processor Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {processors.map((processor) => (
              <div 
                key={processor.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  processor.status === 'busy' 
                    ? 'border-green-500 bg-green-900/20' 
                    : processor.status === 'synchronizing'
                      ? 'border-yellow-500 bg-yellow-900/20'
                      : 'border-gray-600 bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Cpu className={`w-6 h-6 ${
                      processor.status === 'busy' ? 'text-green-400' :
                      processor.status === 'synchronizing' ? 'text-yellow-400' : 'text-gray-400'
                    }`} />
                    <span className="font-medium text-white">{processor.name}</span>
                    <Badge 
                      variant={
                        processor.status === 'busy' ? 'default' : 
                        processor.status === 'synchronizing' ? 'secondary' : 'outline'
                      }
                      className={`text-xs ${
                        processor.status === 'busy' ? 'bg-green-500' :
                        processor.status === 'synchronizing' ? 'bg-yellow-500' : ''
                      }`}
                    >
                      {processor.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Load</span>
                    <span>{Math.round(processor.load)}%</span>
                  </div>
                  <Progress value={processor.load} className="h-2" />
                  
                  {processor.task && (
                    <div className="text-sm text-gray-400">
                      Current Task: {processor.task}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Queue */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Parallel Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  task.status === 'running' 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : task.status === 'completed'
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-gray-600 bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{task.name}</span>
                    <Badge 
                      variant={
                        task.status === 'completed' ? 'default' : 
                        task.status === 'running' ? 'secondary' : 'outline'
                      }
                      className={`text-xs ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'running' ? 'bg-blue-500' : ''
                      }`}
                    >
                      {task.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    {task.assignedProcessors.length > 0 && (
                      <span>CPUs: {task.assignedProcessors.join(', ')}</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((task.completedWork / task.totalWork) * 100)}%</span>
                  </div>
                  <Progress value={(task.completedWork / task.totalWork) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
