"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Progress } from "../ui/Progress"
import { Badge } from "../ui/Badge"
import { Users, Clock, Cpu, Activity } from 'lucide-react'

export default function TimeSharingSystem({ isRunning }) {
  const [users, setUsers] = useState([
    { id: 1, name: "User A", process: "Text Editor", timeSlice: 0, progress: 0, status: 'waiting', priority: 1, color: 'bg-blue-500' },
    { id: 2, name: "User B", process: "Compiler", timeSlice: 0, progress: 0, status: 'waiting', priority: 2, color: 'bg-green-500' },
    { id: 3, name: "User C", process: "Database Query", timeSlice: 0, progress: 0, status: 'waiting', priority: 1, color: 'bg-purple-500' },
    { id: 4, name: "User D", process: "Web Browser", timeSlice: 0, progress: 0, status: 'waiting', priority: 3, color: 'bg-red-500' },
  ])
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [systemLoad, setSystemLoad] = useState(0)
  const [timeQuantum] = useState(100) // Time slice in ms
  const [totalTime, setTotalTime] = useState(0)

  useEffect(() => {
    if (!isRunning) {
      setUsers(prev => prev.map(u => ({
        ...u,
        timeSlice: 0,
        progress: 0,
        status: 'waiting'
      })))
      setCurrentUserIndex(0)
      setSystemLoad(0)
      setTotalTime(0)
      return
    }

    const interval = setInterval(() => {
      setTotalTime(prev => prev + 50)

      setUsers(prevUsers => {
        const newUsers = [...prevUsers]
        const activeUsers = newUsers.filter(u => u.status !== 'completed')

        if (activeUsers.length === 0) return newUsers

        const currentUser = activeUsers[currentUserIndex % activeUsers.length]

        activeUsers.forEach(user => {
          if (user.status === 'active') user.status = 'waiting'
        })

        currentUser.status = 'active'
        currentUser.timeSlice += 50
        currentUser.progress += Math.random() * 2 + 1

        if (currentUser.timeSlice >= timeQuantum) {
          currentUser.timeSlice = 0
          setCurrentUserIndex(prev => (prev + 1) % activeUsers.length)
        }

        if (currentUser.progress >= 100) {
          currentUser.progress = 100
          currentUser.status = 'completed'
          currentUser.timeSlice = 0
        }

        return newUsers
      })

      const activeUserCount = users.filter(u => u.status !== 'completed').length
      setSystemLoad(activeUserCount > 0 ? Math.min(activeUserCount * 20 + Math.random() * 30, 100) : 0)

    }, 50)

    return () => clearInterval(interval)
  }, [isRunning, currentUserIndex, users, timeQuantum])

  const activeUsers = users.filter(u => u.status !== 'completed')
  const completedUsers = users.filter(u => u.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Time Sharing System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                Time sharing systems allow multiple users to share the CPU simultaneously by
                allocating small time slices (quantum) to each user in a round-robin fashion.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">Features:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Interactive user sessions</li>
                  <li>• Round-robin scheduling</li>
                  <li>• Time quantum allocation</li>
                  <li>• Fair resource sharing</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-400">Benefits:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Multiple concurrent users</li>
                  <li>• Fast response time</li>
                  <li>• Better resource utilization</li>
                  <li>• Interactive computing</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.length}</div>
            <div className="text-sm text-gray-400">Online</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              Time Quantum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeQuantum}ms</div>
            <div className="text-sm text-gray-400">Per user</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              System Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemLoad)}%</div>
            <Progress value={systemLoad} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalTime / 1000)}s</div>
            <div className="text-sm text-gray-400">Running</div>
          </CardContent>
        </Card>
      </div>

      {/* User Processes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">User Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${user.status === 'active'
                    ? 'border-blue-500 bg-blue-900/20 scale-105'
                    : user.status === 'completed'
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-gray-600 bg-gray-700'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${user.color}`} />
                    <span className="font-medium text-white">{user.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {user.process}
                    </Badge>
                    <Badge
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className={`text-xs ${user.status === 'active' ? 'bg-blue-500' :
                          user.status === 'completed' ? 'bg-green-500' : ''
                        }`}
                    >
                      {user.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    Priority: {user.priority} |
                    Time: {user.timeSlice}ms
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(user.progress)}%</span>
                  </div>
                  <Progress value={user.progress} className="h-2" />

                  {user.status === 'active' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Time Slice Usage</span>
                        <span>{user.timeSlice}/{timeQuantum}ms</span>
                      </div>
                      <Progress
                        value={(user.timeSlice / timeQuantum) * 100}
                        className="h-1 mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slice Visualization */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">CPU Scheduling Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-700 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex">
              {users.map((user) => {
                const width = user.status === 'completed' ? '25%' :
                  user.status === 'active' ? `${(user.timeSlice / timeQuantum) * 25}%` : '25%'
                return (
                  <div
                    key={user.id}
                    className={`${user.color} border-r border-gray-600 flex items-center justify-center text-white text-sm font-medium transition-all duration-300 ${user.status === 'active' ? 'animate-pulse' : ''
                      }`}
                    style={{ width }}
                  >
                    {user.name}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400 text-center">
            CPU time allocation across users (Time Quantum: {timeQuantum}ms each)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
