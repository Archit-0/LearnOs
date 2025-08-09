"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Progress } from "../ui/Progress"
import { Badge } from "../ui/Badge"
import { Laptop, User, Mouse, Keyboard, MonitorSpeaker } from 'lucide-react'

export default function PersonalComputerSystem({ isRunning }) {
  const [applications, setApplications] = useState([
    { id: 1, name: "Web Browser", type: 'foreground', cpuUsage: 0, memoryUsage: 35, status: 'active', icon: '🌐' },
    { id: 2, name: "Text Editor", type: 'foreground', cpuUsage: 0, memoryUsage: 15, status: 'running', icon: '📝' },
    { id: 3, name: "Music Player", type: 'background', cpuUsage: 0, memoryUsage: 20, status: 'running', icon: '🎵' },
    { id: 4, name: "Antivirus", type: 'background', cpuUsage: 0, memoryUsage: 25, status: 'running', icon: '🛡️' },
    { id: 5, name: "File Manager", type: 'foreground', cpuUsage: 0, memoryUsage: 10, status: 'minimized', icon: '📁' },
  ])

  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 45,
    userInteractions: 0
  })

  const [userActions, setUserActions] = useState([])

  useEffect(() => {
    if (!isRunning) {
      setApplications(prev => prev.map(app => ({ ...app, cpuUsage: 0 })))
      setSystemMetrics({ cpuUsage: 0, memoryUsage: 0, diskUsage: 45, userInteractions: 0 })
      setUserActions([])
      return
    }

    const interval = setInterval(() => {
      setApplications(prevApps => {
        const newApps = prevApps.map(app => ({
          ...app,
          cpuUsage: app.status === 'active'
            ? Math.random() * 40 + 20
            : app.type === 'background'
              ? Math.random() * 10 + 2
              : Math.random() * 5 + 1
        }))

        if (Math.random() < 0.3) {
          const foregroundApps = newApps.filter(app => app.type === 'foreground')
          const randomApp = foregroundApps[Math.floor(Math.random() * foregroundApps.length)]

          newApps.forEach(app => {
            app.status = app.id === randomApp.id ? 'active' :
              app.type === 'background' ? 'running' : 'minimized'
          })

          const actions = [
            `Switched to ${randomApp.name}`,
            `Clicked on ${randomApp.name}`,
            `Opened ${randomApp.name}`,
            `Focused on ${randomApp.name}`
          ]

          setUserActions(prev => [
            ...prev.slice(-4),
            actions[Math.floor(Math.random() * actions.length)]
          ])
        }

        return newApps
      })

      const totalCpu = applications.reduce((sum, app) => sum + app.cpuUsage, 0)
      const totalMemory = applications.reduce((sum, app) => sum + app.memoryUsage, 0)

      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.min(totalCpu + Math.random() * 10, 100),
        memoryUsage: Math.min(totalMemory + Math.random() * 5, 100),
        userInteractions: prev.userInteractions + (Math.random() < 0.4 ? 1 : 0)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, applications])

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Personal Computer System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                Personal Computer Systems are designed for single users with interactive,
                user-friendly interfaces. They prioritize responsiveness and ease of use.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">Characteristics:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Single user focus</li>
                  <li>• Interactive GUI</li>
                  <li>• Multitasking capability</li>
                  <li>• User-friendly interface</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-400">Features:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Window management</li>
                  <li>• Device drivers</li>
                  <li>• File system</li>
                  <li>• Application support</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              User Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-400 font-medium">ACTIVE</div>
            <div className="text-xs text-gray-400">Interactive Session</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Laptop className="w-5 h-5 text-green-400" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.cpuUsage)}%</div>
            <Progress value={systemMetrics.cpuUsage} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MonitorSpeaker className="w-5 h-5 text-purple-400" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.memoryUsage)}%</div>
            <Progress value={systemMetrics.memoryUsage} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mouse className="w-5 h-5 text-red-400" />
              Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.userInteractions}</div>
            <div className="text-xs text-gray-400">User actions</div>
          </CardContent>
        </Card>
      </div>

      {/* Running Applications */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Running Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${app.status === 'active'
                    ? 'border-blue-500 bg-blue-900/20 scale-105'
                    : 'border-gray-600 bg-gray-700'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{app.icon}</span>
                    <span className="font-medium text-white">{app.name}</span>
                    <Badge
                      variant={app.type === 'foreground' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {app.type}
                    </Badge>
                    <Badge
                      variant={
                        app.status === 'active' ? 'default' :
                          app.status === 'running' ? 'secondary' : 'outline'
                      }
                      className={`text-xs ${app.status === 'active' ? 'bg-green-500' :
                          app.status === 'running' ? 'bg-blue-500' : ''
                        }`}
                    >
                      {app.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{Math.round(app.cpuUsage)}%</span>
                    </div>
                    <Progress value={app.cpuUsage} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>{app.memoryUsage}%</span>
                    </div>
                    <Progress value={app.memoryUsage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Activity Log */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Recent User Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {userActions.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                Start simulation to see user interactions...
              </div>
            ) : (
              userActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-gray-700 rounded text-sm"
                >
                  <span className="text-blue-400">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-gray-300">{action}</span>
                  <span className="text-xs text-gray-500 ml-auto">just now</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Architecture */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">PC System Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-700 rounded-lg">
              <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">User Interface</h4>
              <p className="text-sm text-gray-400">GUI, Desktop, Windows</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <Laptop className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Operating System</h4>
              <p className="text-sm text-gray-400">Windows, macOS, Linux</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <MonitorSpeaker className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Hardware</h4>
              <p className="text-sm text-gray-400">CPU, RAM, Storage, I/O</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
