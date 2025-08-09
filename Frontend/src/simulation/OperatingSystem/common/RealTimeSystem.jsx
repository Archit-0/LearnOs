"use client"


import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Progress } from "../ui/Progress"
import { Badge } from "../ui/Badge"
import { Clock, Zap, AlertTriangle, CheckCircle, Timer } from 'lucide-react'

export default function RealTimeSystem({ isRunning }) {
  const [tasks, setTasks] = useState([
    { id: 1, name: "Engine Control", priority: 'high', deadline: 50, executionTime: 20, remainingTime: 20, status: 'waiting', arrivalTime: 0, color: 'bg-red-500' },
    { id: 2, name: "Sensor Reading", priority: 'high', deadline: 30, executionTime: 10, remainingTime: 10, status: 'waiting', arrivalTime: 5, color: 'bg-orange-500' },
    { id: 3, name: "Display Update", priority: 'medium', deadline: 100, executionTime: 15, remainingTime: 15, status: 'waiting', arrivalTime: 10, color: 'bg-blue-500' },
    { id: 4, name: "Log Writing", priority: 'low', deadline: 200, executionTime: 25, remainingTime: 25, status: 'waiting', arrivalTime: 15, color: 'bg-green-500' },
  ])

  const [systemTime, setSystemTime] = useState(0)
  const [currentTask, setCurrentTask] = useState(null)
  const [systemMetrics, setSystemMetrics] = useState({
    tasksCompleted: 0,
    tasksMissed: 0,
    cpuUtilization: 0,
    averageResponseTime: 0
  })

  useEffect(() => {
    if (!isRunning) {
      setTasks(prev => prev.map(t => ({
        ...t,
        remainingTime: t.executionTime,
        status: 'waiting'
      })))
      setSystemTime(0)
      setCurrentTask(null)
      setSystemMetrics({ tasksCompleted: 0, tasksMissed: 0, cpuUtilization: 0, averageResponseTime: 0 })
      return
    }

    const interval = setInterval(() => {
      setSystemTime(prev => prev + 1)

      setTasks(prevTasks => {
        const newTasks = [...prevTasks]

        // Check for deadline misses
        newTasks.forEach(task => {
          if (task.status === 'waiting' || task.status === 'executing') {
            if (systemTime >= task.arrivalTime + task.deadline) {
              task.status = 'missed'
            }
          }
        })

        // Priority-based scheduling (Rate Monotonic)
        const readyTasks = newTasks.filter(t =>
          t.status === 'waiting' && systemTime >= t.arrivalTime
        ).sort((a, b) => a.deadline - b.deadline)

        if (readyTasks.length > 0 && !currentTask) {
          const taskToExecute = readyTasks[0]
          taskToExecute.status = 'executing'
          setCurrentTask(taskToExecute)
        }

        if (currentTask) {
          const executingTask = newTasks.find(t => t.id === currentTask.id)
          if (executingTask && executingTask.status === 'executing') {
            executingTask.remainingTime -= 1
            if (executingTask.remainingTime <= 0) {
              executingTask.status = 'completed'
              executingTask.remainingTime = 0
              setCurrentTask(null)
            }
          }
        }

        // Add new tasks periodically
        if (systemTime % 60 === 0 && systemTime > 0) {
          const newTaskId = Math.max(...newTasks.map(t => t.id)) + 1
          const taskTypes = [
            { name: "Sensor Reading", priority: 'high', deadline: 30, executionTime: 10, color: 'bg-orange-500' },
            { name: "Control Signal", priority: 'high', deadline: 40, executionTime: 15, color: 'bg-red-500' },
            { name: "Status Update", priority: 'medium', deadline: 80, executionTime: 12, color: 'bg-blue-500' },
          ]
          const taskTemplate = taskTypes[Math.floor(Math.random() * taskTypes.length)]
          newTasks.push({
            id: newTaskId,
            name: `${taskTemplate.name} ${newTaskId}`,
            priority: taskTemplate.priority,
            deadline: taskTemplate.deadline,
            executionTime: taskTemplate.executionTime,
            remainingTime: taskTemplate.executionTime,
            status: 'waiting',
            arrivalTime: systemTime,
            color: taskTemplate.color
          })
        }

        return newTasks
      })

      const completed = tasks.filter(t => t.status === 'completed').length
      const missed = tasks.filter(t => t.status === 'missed').length
      const executing = tasks.filter(t => t.status === 'executing').length

      setSystemMetrics({
        tasksCompleted: completed,
        tasksMissed: missed,
        cpuUtilization: executing > 0 ? 85 + Math.random() * 15 : Math.random() * 10,
        averageResponseTime: 15 + Math.random() * 10
      })

    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, currentTask, systemTime, tasks])

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'missed')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const missedTasks = tasks.filter(t => t.status === 'missed')

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Real-Time Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                Real-time systems must respond to events within strict time constraints.
                They are classified as hard real-time (missing deadlines is catastrophic)
                or soft real-time (missing deadlines degrades performance).
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">Types:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Hard Real-time Systems</li>
                  <li>• Soft Real-time Systems</li>
                  <li>• Firm Real-time Systems</li>
                  <li>• Mixed Real-time Systems</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-400">Applications:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Automotive control systems</li>
                  <li>• Medical devices</li>
                  <li>• Industrial automation</li>
                  <li>• Multimedia systems</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-400" />
              System Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemTime}ms</div>
            <div className="text-sm text-gray-400">Running</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{systemMetrics.tasksCompleted}</div>
            <div className="text-sm text-gray-400">Tasks</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Missed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{systemMetrics.tasksMissed}</div>
            <div className="text-sm text-gray-400">Deadlines</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.cpuUtilization)}%</div>
            <Progress value={systemMetrics.cpuUtilization} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.averageResponseTime)}ms</div>
            <div className="text-sm text-gray-400">Average</div>
          </CardContent>
        </Card>
      </div>

      {/* Task Queue */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Real-Time Task Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.slice(-8).map((task) => {
              const timeToDeadline = (task.arrivalTime + task.deadline) - systemTime
              const isUrgent = timeToDeadline <= 20 && timeToDeadline > 0
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    task.status === 'executing'
                      ? 'border-blue-500 bg-blue-900/20 scale-105'
                      : task.status === 'completed'
                        ? 'border-green-500 bg-green-900/20'
                        : task.status === 'missed'
                          ? 'border-red-500 bg-red-900/20'
                          : isUrgent
                            ? 'border-yellow-500 bg-yellow-900/20'
                            : 'border-gray-600 bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${task.color}`} />
                      <span className="font-medium text-white">{task.name}</span>
                      <Badge
                        variant={
                          task.priority === 'high' ? 'destructive' :
                          task.priority === 'medium' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'executing' ? 'secondary' :
                          task.status === 'missed' ? 'destructive' : 'outline'
                        }
                        className={`text-xs ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'executing' ? 'bg-blue-500' :
                          task.status === 'missed' ? 'bg-red-500' : ''
                        }`}
                      >
                        {task.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400">
                      Deadline: {task.deadline}ms |
                      {timeToDeadline > 0 ? ` ${timeToDeadline}ms left` : ' OVERDUE'}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Execution Progress</span>
                        <span>{Math.round(((task.executionTime - task.remainingTime) / task.executionTime) * 100)}%</span>
                      </div>
                      <Progress
                        value={((task.executionTime - task.remainingTime) / task.executionTime) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Time to Deadline</span>
                        <span className={timeToDeadline <= 0 ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-gray-400'}>
                          {timeToDeadline <= 0 ? 'MISSED' : `${timeToDeadline}ms`}
                        </span>
                      </div>
                      <Progress
                        value={timeToDeadline <= 0 ? 100 : Math.max(0, 100 - (timeToDeadline / task.deadline) * 100)}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Timeline */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Scheduling Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-700 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-8 bg-gray-600 relative">
                <div
                  className="absolute top-0 bottom-0 w-1 bg-yellow-400"
                  style={{ left: `${(systemTime % 200) / 2}%` }}
                />
                {currentTask && (
                  <div
                    className={`absolute top-1 bottom-1 ${currentTask.color} rounded flex items-center justify-center text-white text-xs font-medium animate-pulse`}
                    style={{
                      left: `${Math.max(0, (systemTime % 200) / 2 - 5)}%`,
                      width: '10%'
                    }}
                  >
                    {currentTask.name.split(' ')[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400 text-center">
            Real-time task execution timeline (Yellow line = current time)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
