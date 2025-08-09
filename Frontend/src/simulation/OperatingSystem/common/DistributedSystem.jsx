"use client"


import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Progress } from "../ui/Progress"
import { Badge } from "../ui/Badge"
import { Globe, Server, Wifi, Database } from 'lucide-react'

export default function DistributedSystem({ isRunning }) {
  const [nodes, setNodes] = useState([
    { id: 1, name: "Node-US", location: "New York", status: 'online', load: 0, connections: [2, 3], data: 100, color: 'bg-blue-500' },
    { id: 2, name: "Node-EU", location: "London", status: 'online', load: 0, connections: [1, 4], data: 85, color: 'bg-green-500' },
    { id: 3, name: "Node-AS", location: "Tokyo", status: 'online', load: 0, connections: [1, 4], data: 92, color: 'bg-purple-500' },
    { id: 4, name: "Node-AU", location: "Sydney", status: 'online', load: 0, connections: [2, 3], data: 78, color: 'bg-red-500' },
  ])

  const [messages, setMessages] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({
    totalNodes: 4,
    onlineNodes: 4,
    networkLatency: 0,
    dataConsistency: 100,
    messagesSent: 0
  })

  useEffect(() => {
    if (!isRunning) {
      setNodes(prev => prev.map(n => ({ ...n, status: 'online', load: 0 })))
      setMessages([])
      setSystemMetrics({ totalNodes: 4, onlineNodes: 4, networkLatency: 0, dataConsistency: 100, messagesSent: 0 })
      return
    }

    const interval = setInterval(() => {
      // Simulate node failures and recovery
      setNodes(prevNodes => {
        const newNodes = [...prevNodes]

        newNodes.forEach(node => {
          // Random node failures
          if (Math.random() < 0.05 && node.status === 'online') {
            node.status = 'offline'
          } else if (Math.random() < 0.1 && node.status === 'offline') {
            node.status = 'online'
          }

          // Simulate load
          if (node.status === 'online') {
            node.load = Math.random() * 80 + 10

            // Simulate data synchronization
            if (Math.random() < 0.2) {
              node.status = 'syncing'
              setTimeout(() => {
                setNodes(prev => prev.map(n =>
                  n.id === node.id ? { ...n, status: 'online' } : n
                ))
              }, 2000)
            }
          } else {
            node.load = 0
          }
        })

        return newNodes
      })

      // Generate network messages
      if (Math.random() < 0.7) {
        const onlineNodes = nodes.filter(n => n.status === 'online')
        if (onlineNodes.length >= 2) {
          const fromNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)]
          const connectedNodes = onlineNodes.filter(n => fromNode.connections.includes(n.id))

          if (connectedNodes.length > 0) {
            const toNode = connectedNodes[Math.floor(Math.random() * connectedNodes.length)]
            const messageTypes = ['data', 'sync', 'heartbeat']

            const newMessage = {
              id: Date.now() + Math.random(),
              from: fromNode.id,
              to: toNode.id,
              type: messageTypes[Math.floor(Math.random() * messageTypes.length)],
              status: 'sending',
              timestamp: Date.now()
            }

            setMessages(prev => [...prev.slice(-9), newMessage])

            // Simulate message delivery
            setTimeout(() => {
              setMessages(prev => prev.map(msg =>
                msg.id === newMessage.id
                  ? { ...msg, status: Math.random() < 0.9 ? 'delivered' : 'failed' }
                  : msg
              ))
            }, 1000 + Math.random() * 2000)
          }
        }
      }

      // Update system metrics
      const onlineCount = nodes.filter(n => n.status === 'online').length
      const offlineCount = nodes.filter(n => n.status === 'offline').length

      setSystemMetrics(prev => ({
        totalNodes: nodes.length,
        onlineNodes: onlineCount,
        networkLatency: 50 + Math.random() * 100,
        dataConsistency: Math.max(60, 100 - (offlineCount * 15)),
        messagesSent: prev.messagesSent + (Math.random() < 0.7 ? 1 : 0)
      }))

    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, nodes])

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Distributed Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                Distributed systems consist of multiple interconnected computers that work together
                as a single system, sharing resources and coordinating activities across a network.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">Characteristics:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Resource sharing</li>
                  <li>• Fault tolerance</li>
                  <li>• Scalability</li>
                  <li>• Transparency</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-400">Challenges:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Network latency</li>
                  <li>• Data consistency</li>
                  <li>• Partial failures</li>
                  <li>• Security concerns</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Nodes Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics.onlineNodes}/{systemMetrics.totalNodes}
            </div>
            <div className="text-sm text-gray-400">Active nodes</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-400" />
              Network Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.networkLatency)}ms</div>
            <div className="text-sm text-gray-400">Average</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Data Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.dataConsistency)}%</div>
            <Progress value={systemMetrics.dataConsistency} className="h-2 mt-1" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-400" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.messagesSent}</div>
            <div className="text-sm text-gray-400">Total sent</div>
          </CardContent>
        </Card>
      </div>

      {/* Network Nodes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Network Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${node.status === 'online'
                  ? 'border-green-500 bg-green-900/20'
                  : node.status === 'syncing'
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-red-500 bg-red-900/20'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Server className={`w-6 h-6 ${node.status === 'online' ? 'text-green-400' :
                      node.status === 'syncing' ? 'text-yellow-400' : 'text-red-400'
                      }`} />
                    <div>
                      <span className="font-medium text-white block">{node.name}</span>
                      <span className="text-sm text-gray-400">{node.location}</span>
                    </div>
                    <Badge
                      variant={
                        node.status === 'online' ? 'default' :
                          node.status === 'syncing' ? 'secondary' : 'destructive'
                      }
                      className={`text-xs ${node.status === 'online' ? 'bg-green-500' :
                        node.status === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                    >
                      {node.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Load</span>
                    <span>{Math.round(node.load)}%</span>
                  </div>
                  <Progress value={node.load} className="h-2" />

                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Data: {node.data}GB</span>
                    <span>Connections: {node.connections.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Log */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Network Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                Start simulation to see network traffic...
              </div>
            ) : (
              messages.slice(-10).reverse().map((message) => {
                const fromNode = nodes.find(n => n.id === message.from)
                const toNode = nodes.find(n => n.id === message.to)

                return (
                  <div
                    key={message.id}
                    className="flex items-center gap-3 p-2 bg-gray-700 rounded text-sm"
                  >
                    <div className={`w-2 h-2 rounded-full ${message.status === 'delivered' ? 'bg-green-400' :
                      message.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                      }`} />
                    <span className="text-blue-400">{fromNode?.name}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-400">{toNode?.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {message.type}
                    </Badge>
                    <span className={`text-xs ml-auto ${message.status === 'delivered' ? 'text-green-400' :
                      message.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                      {message.status}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Network Topology */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Network Topology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-700 rounded-lg relative overflow-hidden">
            <div className="absolute inset-4">
              {/* Simplified network visualization */}
              <div className="grid grid-cols-2 gap-8 h-full">
                {nodes.map((node, index) => (
                  <div
                    key={node.id}
                    className={`flex items-center justify-center rounded-full w-16 h-16 ${node.color} ${node.status === 'offline' ? 'opacity-50' :
                      node.status === 'syncing' ? 'animate-pulse' : ''
                      }`}
                    style={{
                      position: 'absolute',
                      left: `${25 + (index % 2) * 50}%`,
                      top: `${25 + Math.floor(index / 2) * 50}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="text-white text-xs font-bold">{node.name.split('-')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400 text-center">
            Distributed nodes across different geographical locations
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
