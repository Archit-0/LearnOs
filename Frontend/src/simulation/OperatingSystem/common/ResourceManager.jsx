
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Progress } from "../ui/Progress"
import { Badge } from "../ui/Badge"
import { Cpu, MemoryStick, HardDrive, Wifi, Users, Settings, Activity, Database } from 'lucide-react'

export default function ResourceManager({ isRunning }) {
  const [resources, setResources] = useState([
    {
      id: 1,
      name: "CPU Cores",
      type: 'cpu',
      total: 100,
      used: 0,
      allocated: [],
      icon: Cpu,
      color: 'text-blue-400'
    },
    {
      id: 2,
      name: "Memory (RAM)",
      type: 'memory',
      total: 8192,
      used: 0,
      allocated: [],
      icon: MemoryStick,
      color: 'text-green-400'
    },
    {
      id: 3,
      name: "Disk Space",
      type: 'disk',
      total: 1000,
      used: 0,
      allocated: [],
      icon: HardDrive,
      color: 'text-purple-400'
    },
    {
      id: 4,
      name: "Network Bandwidth",
      type: 'network',
      total: 1000,
      used: 0,
      allocated: [],
      icon: Wifi,
      color: 'text-red-400'
    },
  ])

  const [processes, setProcesses] = useState([
    {
      id: 1,
      name: "Web Browser",
      priority: 2,
      resources: [
        { type: 'cpu', amount: 25 },
        { type: 'memory', amount: 2048 },
        { type: 'network', amount: 200 }
      ],
      status: 'running',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: "Video Editor",
      priority: 1,
      resources: [
        { type: 'cpu', amount: 40 },
        { type: 'memory', amount: 3072 },
        { type: 'disk', amount: 100 }
      ],
      status: 'waiting',
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: "Database",
      priority: 1,
      resources: [
        { type: 'cpu', amount: 15 },
        { type: 'memory', amount: 1024 },
        { type: 'disk', amount: 200 }
      ],
      status: 'running',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      name: "File Transfer",
      priority: 3,
      resources: [
        { type: 'cpu', amount: 10 },
        { type: 'network', amount: 500 },
        { type: 'disk', amount: 50 }
      ],
      status: 'blocked',
      color: 'bg-red-500'
    },
  ])

  const [systemMetrics, setSystemMetrics] = useState({
    totalProcesses: 4,
    runningProcesses: 0,
    waitingProcesses: 0,
    blockedProcesses: 0,
    resourceUtilization: 0
  })

  useEffect(() => {
    if (!isRunning) {
      setResources(prev => prev.map(r => ({ ...r, used: 0, allocated: [] })))
      setProcesses(prev => prev.map(p => ({ ...p, status: 'waiting' })))
      setSystemMetrics({ totalProcesses: 4, runningProcesses: 0, waitingProcesses: 4, blockedProcesses: 0, resourceUtilization: 0 })
      return
    }

    const interval = setInterval(() => {
      // Process state changes
      setProcesses(prevProcesses => {
        const newProcesses = [...prevProcesses]

        newProcesses.forEach(process => {
          if (process.status === 'waiting') {
            const canAllocate = process.resources.every(req => {
              const resource = resources.find(r => r.type === req.type)
              return resource && (resource.used + req.amount <= resource.total)
            })
            if (canAllocate) process.status = 'running'
          } else if (process.status === 'running') {
            if (Math.random() < 0.1) process.status = 'blocked'
            else if (Math.random() < 0.05) process.status = 'waiting'
          } else if (process.status === 'blocked') {
            if (Math.random() < 0.3) process.status = 'waiting'
          }
        })

        return newProcesses
      })

      // Resource usage update
      setResources(prevResources => {
        const newResources = prevResources.map(resource => ({
          ...resource,
          used: 0,
          allocated: []
        }))

        processes.forEach(process => {
          if (process.status === 'running') {
            process.resources.forEach(req => {
              const resource = newResources.find(r => r.type === req.type)
              if (resource) {
                resource.used += req.amount
                resource.allocated.push({ processId: process.id, amount: req.amount })
              }
            })
          }
        })

        return newResources
      })

      // Metrics update
      const running = processes.filter(p => p.status === 'running').length
      const waiting = processes.filter(p => p.status === 'waiting').length
      const blocked = processes.filter(p => p.status === 'blocked').length
      const avgUtilization = resources.reduce((sum, r) => sum + (r.used / r.total) * 100, 0) / resources.length

      setSystemMetrics({
        totalProcesses: processes.length,
        runningProcesses: running,
        waitingProcesses: waiting,
        blockedProcesses: blocked,
        resourceUtilization: avgUtilization
      })

    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, processes, resources])

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">OS as a Resource Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                The Operating System acts as a resource manager, controlling access to system
                resources like CPU, memory, storage, and I/O devices. It ensures fair allocation,
                prevents conflicts, and maximizes system efficiency.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">Key Functions:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Resource allocation</li>
                  <li>• Resource scheduling</li>
                  <li>• Deadlock prevention</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-400">Resource Types:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Processor time (CPU)</li>
                  <li>• Memory space (RAM)</li>
                  <li>• Storage devices</li>
                  <li>• Network bandwidth</li>
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
              <Users className="w-5 h-5 text-blue-400" />
              Total Processes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalProcesses}</div>
            <div className="text-sm text-gray-400">Active</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{systemMetrics.runningProcesses}</div>
            <div className="text-sm text-gray-400">Processes</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Waiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{systemMetrics.waitingProcesses}</div>
            <div className="text-sm text-gray-400">For resources</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.resourceUtilization)}%</div>
            <Progress value={systemMetrics.resourceUtilization} className="h-2 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Resource Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">System Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((resource) => {
              const Icon = resource.icon
              const utilizationPercent = (resource.used / resource.total) * 100

              return (
                <div
                  key={resource.id}
                  className="p-4 rounded-lg border border-gray-600 bg-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${resource.color}`} />
                      <span className="font-medium text-white">{resource.name}</span>
                    </div>
                    <Badge
                      variant={utilizationPercent > 80 ? 'destructive' : utilizationPercent > 50 ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {Math.round(utilizationPercent)}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage</span>
                      <span>
                        {resource.used} / {resource.total}
                        {resource.type === 'memory' ? ' MB' :
                          resource.type === 'disk' ? ' GB' :
                            resource.type === 'network' ? ' Mbps' : '%'}
                      </span>
                    </div>
                    <Progress value={utilizationPercent} className="h-2" />

                    {resource.allocated.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-400 mb-1">Allocated to:</div>
                        <div className="space-y-1">
                          {resource.allocated.map((allocation, index) => {
                            const process = processes.find(p => p.id === allocation.processId)
                            return (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-gray-300">{process?.name}</span>
                                <span className="text-gray-400">
                                  {allocation.amount}
                                  {resource.type === 'memory' ? ' MB' :
                                    resource.type === 'disk' ? ' GB' :
                                      resource.type === 'network' ? ' Mbps' : '%'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Process Management */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Process Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processes.map((process) => (
              <div
                key={process.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${process.status === 'running'
                  ? 'border-green-500 bg-green-900/20'
                  : process.status === 'blocked'
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-yellow-500 bg-yellow-900/20'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${process.color}`} />
                    <span className="font-medium text-white">{process.name}</span>
                    <Badge variant="outline" className="text-xs">
                      Priority: {process.priority}
                    </Badge>
                    <Badge
                      variant={
                        process.status === 'running' ? 'default' :
                          process.status === 'blocked' ? 'destructive' : 'secondary'
                      }
                      className={`text-xs ${process.status === 'running' ? 'bg-green-500' :
                        process.status === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                    >
                      {process.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Resource Requirements:</h4>
                    <div className="space-y-1">
                      {process.resources.map((req, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-400 capitalize">{req.type}:</span>
                          <span className="text-gray-300">
                            {req.amount}
                            {req.type === 'memory' ? ' MB' :
                              req.type === 'disk' ? ' GB' :
                                req.type === 'network' ? ' Mbps' : '%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Status Information:</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Process ID:</span>
                        <span className="text-gray-300">{process.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Priority Level:</span>
                        <span className="text-gray-300">
                          {process.priority === 1 ? 'High' :
                            process.priority === 2 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">State:</span>
                        <span className={`${process.status === 'running' ? 'text-green-400' :
                          process.status === 'blocked' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                          {process.status === 'running' ? 'Executing' :
                            process.status === 'blocked' ? 'I/O Wait' : 'Ready Queue'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation Matrix */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Resource Allocation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-2 text-gray-300">Process</th>
                  <th className="text-center p-2 text-blue-400">CPU %</th>
                  <th className="text-center p-2 text-green-400">Memory MB</th>
                  <th className="text-center p-2 text-purple-400">Disk GB</th>
                  <th className="text-center p-2 text-red-400">Network Mbps</th>
                  <th className="text-center p-2 text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process) => (
                  <tr key={process.id} className="border-b border-gray-700">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${process.color}`} />
                        <span className="text-white">{process.name}</span>
                      </div>
                    </td>
                    <td className="text-center p-2 text-gray-300">
                      {process.resources.find(r => r.type === 'cpu')?.amount || 0}
                    </td>
                    <td className="text-center p-2 text-gray-300">
                      {process.resources.find(r => r.type === 'memory')?.amount || 0}
                    </td>
                    <td className="text-center p-2 text-gray-300">
                      {process.resources.find(r => r.type === 'disk')?.amount || 0}
                    </td>
                    <td className="text-center p-2 text-gray-300">
                      {process.resources.find(r => r.type === 'network')?.amount || 0}
                    </td>
                    <td className="text-center p-2">
                      <Badge
                        variant={
                          process.status === 'running' ? 'default' :
                            process.status === 'blocked' ? 'destructive' : 'secondary'
                        }
                        className={`text-xs ${process.status === 'running' ? 'bg-green-500' :
                          process.status === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                      >
                        {process.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

