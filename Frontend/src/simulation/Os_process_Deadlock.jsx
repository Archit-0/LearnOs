import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Cpu, Clock, Users } from 'lucide-react';

const OSSimulation = () => {
  const [currentTab, setCurrentTab] = useState('intro');
  const [isRunning, setIsRunning] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [resources, setResources] = useState([]);
  const [deadlockDetected, setDeadlockDetected] = useState(false);
  const [timeSlice, setTimeSlice] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  // Process states
  const PROCESS_STATES = {
    NEW: 'new',
    READY: 'ready',
    RUNNING: 'running',
    WAITING: 'waiting',
    TERMINATED: 'terminated'
  };

  // Initialize processes and resources
  const initializeSystem = useCallback(() => {
    const initialProcesses = [
      { id: 1, name: 'Process A', state: PROCESS_STATES.READY, priority: 1, burstTime: 5, remainingTime: 5, waitingTime: 0, resources: [], waitingFor: null },
      { id: 2, name: 'Process B', state: PROCESS_STATES.READY, priority: 2, burstTime: 3, remainingTime: 3, waitingTime: 0, resources: [], waitingFor: null },
      { id: 3, name: 'Process C', state: PROCESS_STATES.READY, priority: 3, burstTime: 4, remainingTime: 4, waitingTime: 0, resources: [], waitingFor: null }
    ];

    const initialResources = [
      { id: 1, name: 'Resource R1', available: true, heldBy: null },
      { id: 2, name: 'Resource R2', available: true, heldBy: null },
      { id: 3, name: 'Resource R3', available: true, heldBy: null }
    ];

    setProcesses(initialProcesses);
    setResources(initialResources);
    setDeadlockDetected(false);
    setTimeSlice(0);
    setCpuUsage(0);
  }, []);

  // Deadlock simulation
  const simulateDeadlock = () => {
    const deadlockProcesses = [
      { id: 1, name: 'Process A', state: PROCESS_STATES.WAITING, priority: 1, burstTime: 5, remainingTime: 5, waitingTime: 3, resources: [1], waitingFor: 2 },
      { id: 2, name: 'Process B', state: PROCESS_STATES.WAITING, priority: 2, burstTime: 3, remainingTime: 3, waitingTime: 2, resources: [2], waitingFor: 3 },
      { id: 3, name: 'Process C', state: PROCESS_STATES.WAITING, priority: 3, burstTime: 4, remainingTime: 4, waitingTime: 4, resources: [3], waitingFor: 1 }
    ];

    const deadlockResources = [
      { id: 1, name: 'Resource R1', available: false, heldBy: 1 },
      { id: 2, name: 'Resource R2', available: false, heldBy: 2 },
      { id: 3, name: 'Resource R3', available: false, heldBy: 3 }
    ];

    setProcesses(deadlockProcesses);
    setResources(deadlockResources);
    setDeadlockDetected(true);
  };

  // Process scheduling simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeSlice(prev => prev + 1);
      
      setProcesses(prevProcesses => {
        const newProcesses = [...prevProcesses];
        let runningProcess = newProcesses.find(p => p.state === PROCESS_STATES.RUNNING);
        
        if (runningProcess) {
          runningProcess.remainingTime -= 1;
          setCpuUsage(80 + Math.random() * 20);
          
          if (runningProcess.remainingTime <= 0) {
            runningProcess.state = PROCESS_STATES.TERMINATED;
            runningProcess = null;
            setCpuUsage(0);
          }
        }

        if (!runningProcess) {
          const readyProcesses = newProcesses.filter(p => p.state === PROCESS_STATES.READY);
          if (readyProcesses.length > 0) {
            const nextProcess = readyProcesses.sort((a, b) => a.priority - b.priority)[0];
            nextProcess.state = PROCESS_STATES.RUNNING;
            setCpuUsage(80 + Math.random() * 20);
          }
        }

        // Update waiting times
        newProcesses.forEach(p => {
          if (p.state === PROCESS_STATES.READY || p.state === PROCESS_STATES.WAITING) {
            p.waitingTime += 1;
          }
        });

        return newProcesses;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const getStateColor = (state) => {
    switch (state) {
      case PROCESS_STATES.NEW: return 'bg-gray-400';
      case PROCESS_STATES.READY: return 'bg-blue-400';
      case PROCESS_STATES.RUNNING: return 'bg-green-400';
      case PROCESS_STATES.WAITING: return 'bg-yellow-400';
      case PROCESS_STATES.TERMINATED: return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    initializeSystem();
  };

  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Operating System Simulation
        </h1>

        {/* Navigation Tabs */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setCurrentTab('intro')}
            className={`px-4 py-2 font-medium ${currentTab === 'intro' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Introduction
          </button>
          <button
            onClick={() => setCurrentTab('processes')}
            className={`px-4 py-2 font-medium ${currentTab === 'processes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Process Management
          </button>
          <button
            onClick={() => setCurrentTab('deadlocks')}
            className={`px-4 py-2 font-medium ${currentTab === 'deadlocks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Deadlock Detection
          </button>
        </div>

        {/* Introduction Tab */}
        {currentTab === 'intro' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Cpu className="mr-3 text-blue-600" />
                What is an Operating System?
              </h2>
              <p className="text-gray-700 mb-4">
                An Operating System (OS) is system software that manages computer hardware and software resources 
                and provides common services for computer programs. It acts as an interface between applications 
                and the computer hardware.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                  <h3 className="font-bold mb-2">Process Management</h3>
                  <p className="text-sm text-gray-600">
                    Manages creation, scheduling, and termination of processes
                  </p>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-green-500">
                  <h3 className="font-bold mb-2">Resource Management</h3>
                  <p className="text-sm text-gray-600">
                    Allocates and deallocates system resources like CPU, memory, and I/O devices
                  </p>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-purple-500">
                  <h3 className="font-bold mb-2">Synchronization</h3>
                  <p className="text-sm text-gray-600">
                    Coordinates access to shared resources and prevents conflicts
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Key OS Concepts</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <strong>Process:</strong> An instance of a program in execution
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <strong>Scheduling:</strong> Determining which process gets CPU time
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <strong>Deadlock:</strong> A situation where processes are blocked indefinitely
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <strong>Resource:</strong> Hardware or software entities that processes need
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Process Management Tab */}
        {currentTab === 'processes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <Users className="mr-3 text-blue-600" />
                Process Management Simulation
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={toggleSimulation}
                  className={`px-4 py-2 rounded font-medium flex items-center ${
                    isRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 bg-gray-500 text-white rounded font-medium flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-bold">Time Slice</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{timeSlice}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Cpu className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-bold">CPU Usage</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{cpuUsage.toFixed(1)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{width: `${cpuUsage}%`}}></div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-bold">Active Processes</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {processes.filter(p => p.state !== PROCESS_STATES.TERMINATED).length}
                </div>
              </div>
            </div>

            {/* Process Queue Visualization */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Process States</h3>
              <div className="space-y-4">
                {Object.values(PROCESS_STATES).map(state => (
                  <div key={state} className="flex items-center">
                    <div className={`w-20 h-8 ${getStateColor(state)} rounded flex items-center justify-center text-white font-bold text-sm mr-4`}>
                      {state.toUpperCase()}
                    </div>
                    <div className="flex space-x-2 flex-1">
                      {processes.filter(p => p.state === state).map(process => (
                        <div key={process.id} className="bg-white border-2 border-gray-300 rounded-lg p-3 min-w-32">
                          <div className="font-bold text-sm">{process.name}</div>
                          <div className="text-xs text-gray-600">
                            Priority: {process.priority}<br/>
                            Remaining: {process.remainingTime}s<br/>
                            Waiting: {process.waitingTime}s
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process State Legend */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-bold mb-3">Process State Legend</h4>
              <div className="grid md:grid-cols-5 gap-3 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                  <span><strong>NEW:</strong> Just created</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
                  <span><strong>READY:</strong> Waiting for CPU</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
                  <span><strong>RUNNING:</strong> Executing on CPU</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                  <span><strong>WAITING:</strong> Blocked for I/O</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                  <span><strong>TERMINATED:</strong> Finished execution</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deadlock Tab */}
        {currentTab === 'deadlocks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <AlertTriangle className="mr-3 text-red-600" />
                Deadlock Detection System
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={simulateDeadlock}
                  className="px-4 py-2 bg-red-500 text-white rounded font-medium"
                >
                  Simulate Deadlock
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 bg-gray-500 text-white rounded font-medium"
                >
                  Reset System
                </button>
              </div>
            </div>

            {/* Deadlock Alert */}
            {deadlockDetected && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-3" />
                  <div>
                    <h3 className="font-bold text-red-700">Deadlock Detected!</h3>
                    <p className="text-red-600">Circular wait condition detected in the system.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Resource Allocation Graph */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Resource Allocation Graph</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Processes */}
                <div>
                  <h4 className="font-bold mb-3">Processes</h4>
                  <div className="space-y-2">
                    {processes.map(process => (
                      <div key={process.id} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{process.name}</span>
                          <span className={`px-2 py-1 rounded text-xs text-white ${getStateColor(process.state)}`}>
                            {process.state}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Holds: {process.resources.map(r => `R${r}`).join(', ') || 'None'}
                          {process.waitingFor && (
                            <span className="text-red-600 ml-2">
                              Waiting for: R{process.waitingFor}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-bold mb-3">Resources</h4>
                  <div className="space-y-2">
                    {resources.map(resource => (
                      <div key={resource.id} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{resource.name}</span>
                          <span className={`px-2 py-1 rounded text-xs text-white ${
                            resource.available ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {resource.available ? 'Available' : 'Allocated'}
                          </span>
                        </div>
                        {resource.heldBy && (
                          <div className="text-sm text-gray-600 mt-1">
                            Held by: Process {String.fromCharCode(64 + resource.heldBy)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Deadlock Conditions */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Deadlock Conditions (Coffman Conditions)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                    <div>
                      <strong>Mutual Exclusion:</strong> Resources cannot be shared
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                    <div>
                      <strong>Hold and Wait:</strong> Processes hold resources while waiting for others
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                    <div>
                      <strong>No Preemption:</strong> Resources cannot be forcibly taken
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                    <div>
                      <strong>Circular Wait:</strong> Chain of processes waiting for each other
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deadlock Prevention Strategies */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Deadlock Prevention Strategies</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-bold mb-2">Prevention Methods:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Resource ordering (prevent circular wait)</li>
                    <li>• All-or-nothing allocation (prevent hold and wait)</li>
                    <li>• Resource preemption (allow forced release)</li>
                    <li>• Spooling (eliminate mutual exclusion where possible)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Detection & Recovery:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Wait-for graph analysis</li>
                    <li>• Resource allocation graph cycles</li>
                    <li>• Process termination</li>
                    <li>• Resource preemption and rollback</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Learning Points */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold mb-3">Learning Objectives</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-bold mb-2">Process Management</h4>
              <p className="text-gray-700">Understand process lifecycle, scheduling algorithms, and state transitions</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-bold mb-2">Resource Allocation</h4>
              <p className="text-gray-700">Learn how OS manages and allocates system resources efficiently</p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <h4 className="font-bold mb-2">Deadlock Handling</h4>
              <p className="text-gray-700">Recognize deadlock conditions and understand prevention strategies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSSimulation;