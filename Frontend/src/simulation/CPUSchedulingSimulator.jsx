import React, { useState, useEffect } from 'react';
import { Play, Plus, Trash2, RotateCcw, Info, Clock, Users, TrendingUp } from 'lucide-react';

const CPUSchedulingSimulator = () => {
  const [processes, setProcesses] = useState([
    { id: 1, name: 'P1', arrivalTime: 0, burstTime: 8, priority: 1 },
    { id: 2, name: 'P2', arrivalTime: 1, burstTime: 4, priority: 2 },
    { id: 3, name: 'P3', arrivalTime: 2, burstTime: 9, priority: 3 },
    { id: 4, name: 'P4', arrivalTime: 3, burstTime: 5, priority: 1 }
  ]);
  
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [ganttChart, setGanttChart] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Process colors for visualization
  const processColors = {
    'P1': 'bg-blue-500', 'P2': 'bg-green-500', 'P3': 'bg-purple-500', 
    'P4': 'bg-red-500', 'P5': 'bg-yellow-500', 'P6': 'bg-indigo-500',
    'IDLE': 'bg-gray-300'
  };

  // CPU Scheduling Algorithms Implementation
  const simulateFCFS = (processes) => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const gantt = [];
    const results = [];
    let currentTime = 0;

    sortedProcesses.forEach((process) => {
      const waitingTime = Math.max(0, currentTime - process.arrivalTime);
      const startTime = Math.max(currentTime, process.arrivalTime);
      const finishTime = startTime + process.burstTime;

      gantt.push({
        processName: process.name,
        startTime,
        endTime: finishTime,
        duration: process.burstTime
      });

      results.push({
        ...process,
        waitingTime,
        turnaroundTime: finishTime - process.arrivalTime,
        responseTime: startTime - process.arrivalTime,
        finishTime
      });

      currentTime = finishTime;
    });

    return { gantt, results };
  };

  const simulateSJF = (processes) => {
    const remainingProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    const gantt = [];
    const results = [];
    let currentTime = 0;

    while (remainingProcesses.length > 0) {
      const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
      
      if (availableProcesses.length === 0) {
        currentTime++;
        continue;
      }

      const shortestProcess = availableProcesses.reduce((prev, curr) => 
        prev.burstTime < curr.burstTime ? prev : curr
      );

      const startTime = currentTime;
      const finishTime = currentTime + shortestProcess.burstTime;

      gantt.push({
        processName: shortestProcess.name,
        startTime,
        endTime: finishTime,
        duration: shortestProcess.burstTime
      });

      results.push({
        ...shortestProcess,
        waitingTime: startTime - shortestProcess.arrivalTime,
        turnaroundTime: finishTime - shortestProcess.arrivalTime,
        responseTime: startTime - shortestProcess.arrivalTime,
        finishTime
      });

      currentTime = finishTime;
      remainingProcesses.splice(remainingProcesses.indexOf(shortestProcess), 1);
    }

    return { gantt, results };
  };

  const simulateRoundRobin = (processes) => {
    const queue = [];
    const gantt = [];
    const results = processes.map(p => ({ 
      ...p, 
      remainingTime: p.burstTime, 
      waitingTime: 0, 
      responseTime: -1,
      firstRun: true 
    }));
    
    let currentTime = 0;
    let processIndex = 0;

    // Add initial processes to queue
    processes.forEach(p => {
      if (p.arrivalTime === 0) queue.push(p.id - 1);
    });

    while (queue.length > 0 || processIndex < processes.length) {
      // Add newly arrived processes to queue
      while (processIndex < processes.length && processes[processIndex].arrivalTime <= currentTime) {
        if (results[processIndex].remainingTime > 0) {
          queue.push(processIndex);
        }
        processIndex++;
      }

      if (queue.length === 0) {
        currentTime++;
        continue;
      }

      const currentProcessIndex = queue.shift();
      const currentProcess = results[currentProcessIndex];
      
      if (currentProcess.firstRun) {
        currentProcess.responseTime = currentTime - processes[currentProcessIndex].arrivalTime;
        currentProcess.firstRun = false;
      }

      const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);
      
      gantt.push({
        processName: processes[currentProcessIndex].name,
        startTime: currentTime,
        endTime: currentTime + executionTime,
        duration: executionTime
      });

      currentTime += executionTime;
      currentProcess.remainingTime -= executionTime;

      // Add newly arrived processes
      while (processIndex < processes.length && processes[processIndex].arrivalTime <= currentTime) {
        if (results[processIndex].remainingTime > 0) {
          queue.push(processIndex);
        }
        processIndex++;
      }

      if (currentProcess.remainingTime > 0) {
        queue.push(currentProcessIndex);
      } else {
        currentProcess.finishTime = currentTime;
        currentProcess.turnaroundTime = currentTime - processes[currentProcessIndex].arrivalTime;
        currentProcess.waitingTime = currentProcess.turnaroundTime - processes[currentProcessIndex].burstTime;
      }
    }

    return { gantt, results };
  };

  const simulatePriority = (processes) => {
    const remainingProcesses = [...processes];
    const gantt = [];
    const results = [];
    let currentTime = 0;

    while (remainingProcesses.length > 0) {
      const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
      
      if (availableProcesses.length === 0) {
        currentTime++;
        continue;
      }

      const highestPriorityProcess = availableProcesses.reduce((prev, curr) => 
        prev.priority < curr.priority ? prev : curr
      );

      const startTime = currentTime;
      const finishTime = currentTime + highestPriorityProcess.burstTime;

      gantt.push({
        processName: highestPriorityProcess.name,
        startTime,
        endTime: finishTime,
        duration: highestPriorityProcess.burstTime
      });

      results.push({
        ...highestPriorityProcess,
        waitingTime: startTime - highestPriorityProcess.arrivalTime,
        turnaroundTime: finishTime - highestPriorityProcess.arrivalTime,
        responseTime: startTime - highestPriorityProcess.arrivalTime,
        finishTime
      });

      currentTime = finishTime;
      remainingProcesses.splice(remainingProcesses.indexOf(highestPriorityProcess), 1);
    }

    return { gantt, results };
  };

  const calculateMetrics = (results) => {
    const totalProcesses = results.length;
    const avgWaitingTime = results.reduce((sum, p) => sum + p.waitingTime, 0) / totalProcesses;
    const avgTurnaroundTime = results.reduce((sum, p) => sum + p.turnaroundTime, 0) / totalProcesses;
    const avgResponseTime = results.reduce((sum, p) => sum + p.responseTime, 0) / totalProcesses;
    
    return {
      avgWaitingTime: avgWaitingTime.toFixed(2),
      avgTurnaroundTime: avgTurnaroundTime.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(2),
      totalTime: Math.max(...results.map(p => p.finishTime)),
      throughput: (totalProcesses / Math.max(...results.map(p => p.finishTime))).toFixed(2)
    };
  };

  const runSimulation = () => {
    let result;
    
    switch (algorithm) {
      case 'FCFS':
        result = simulateFCFS(processes);
        break;
      case 'SJF':
        result = simulateSJF(processes);
        break;
      case 'RR':
        result = simulateRoundRobin(processes);
        break;
      case 'Priority':
        result = simulatePriority(processes);
        break;
      default:
        result = simulateFCFS(processes);
    }
    
    setGanttChart(result.gantt);
    setMetrics(calculateMetrics(result.results));
    animateExecution(result.gantt);
  };

  const animateExecution = (gantt) => {
    setIsAnimating(true);
    setCurrentTime(0);
    
    const totalTime = Math.max(...gantt.map(g => g.endTime));
    let time = 0;
    
    const interval = setInterval(() => {
      time += 0.5;
      setCurrentTime(time);
      
      if (time >= totalTime) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 200);
  };

  const addProcess = () => {
    const newId = processes.length + 1;
    setProcesses([...processes, {
      id: newId,
      name: `P${newId}`,
      arrivalTime: 0,
      burstTime: 5,
      priority: 1
    }]);
  };

  const removeProcess = (id) => {
    if (processes.length > 1) {
      setProcesses(processes.filter(p => p.id !== id));
    }
  };

  const updateProcess = (id, field, value) => {
    setProcesses(processes.map(p => 
      p.id === id ? { ...p, [field]: parseInt(value) || 0 } : p
    ));
  };

  const resetSimulation = () => {
    setGanttChart([]);
    setMetrics(null);
    setCurrentTime(0);
    setIsAnimating(false);
  };

  const algorithmExplanations = {
    'FCFS': 'First Come First Served: Processes are executed in the order they arrive. Simple but can cause convoy effect.',
    'SJF': 'Shortest Job First: Process with shortest burst time is executed first. Minimizes average waiting time.',
    'RR': 'Round Robin: Each process gets a fixed time quantum. Fair scheduling but context switching overhead.',
    'Priority': 'Priority Scheduling: Processes with higher priority (lower number) are executed first.'
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">CPU Scheduling Visualizer</h1>
        <p className="text-lg text-gray-600">Interactive simulation of CPU scheduling algorithms</p>
      </div>

      {/* Algorithm Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Algorithm:</label>
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="FCFS">First Come First Served</option>
              <option value="SJF">Shortest Job First</option>
              <option value="RR">Round Robin</option>
              <option value="Priority">Priority Scheduling</option>
            </select>
          </div>

          {algorithm === 'RR' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Time Quantum:</label>
              <input
                type="number"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(parseInt(e.target.value) || 1)}
                min="1"
                className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Info size={16} />
            Explain Algorithm
          </button>
        </div>

        {showExplanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800">{algorithmExplanations[algorithm]}</p>
          </div>
        )}
      </div>

      {/* Process Input Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Process Configuration</h2>
          <button
            onClick={addProcess}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Add Process
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700 border">Process</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 border">Arrival Time</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 border">Burst Time</th>
                {algorithm === 'Priority' && (
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border">Priority</th>
                )}
                <th className="px-4 py-3 text-left font-medium text-gray-700 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">
                    <div className={`inline-block w-4 h-4 rounded mr-2 ${processColors[process.name]}`}></div>
                    {process.name}
                  </td>
                  <td className="px-4 py-3 border">
                    <input
                      type="number"
                      value={process.arrivalTime}
                      onChange={(e) => updateProcess(process.id, 'arrivalTime', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-3 border">
                    <input
                      type="number"
                      value={process.burstTime}
                      onChange={(e) => updateProcess(process.id, 'burstTime', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </td>
                  {algorithm === 'Priority' && (
                    <td className="px-4 py-3 border">
                      <input
                        type="number"
                        value={process.priority}
                        onChange={(e) => updateProcess(process.id, 'priority', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 border">
                    <button
                      onClick={() => removeProcess(process.id)}
                      disabled={processes.length <= 1}
                      className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={runSimulation}
          disabled={isAnimating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play size={20} />
          {isAnimating ? 'Running...' : 'Run Simulation'}
        </button>
        
        <button
          onClick={resetSimulation}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw size={20} />
          Reset
        </button>
      </div>

      {/* Gantt Chart */}
      {ganttChart.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Gantt Chart</h2>
            {isAnimating && (
              <div className="flex items-center gap-2 text-blue-600">
                <Clock size={16} />
                Current Time: {currentTime.toFixed(1)}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Time scale */}
            <div className="relative">
              <div className="flex">
                {ganttChart.map((segment, index) => (
                  <div
                    key={index}
                    className={`relative h-16 border-2 border-white flex items-center justify-center text-white font-medium ${processColors[segment.processName]} ${
                      isAnimating && currentTime >= segment.startTime && currentTime <= segment.endTime 
                        ? 'ring-4 ring-yellow-400 ring-opacity-75' 
                        : ''
                    }`}
                    style={{ 
                      width: `${(segment.duration / Math.max(...ganttChart.map(g => g.endTime))) * 100}%`,
                      opacity: isAnimating && currentTime < segment.startTime ? 0.3 : 1
                    }}
                  >
                    <div className="text-center">
                      <div className="font-bold">{segment.processName}</div>
                      <div className="text-xs">{segment.duration}ms</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Time markers */}
              <div className="flex mt-2">
                {ganttChart.map((segment, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-xs text-gray-600 border-l border-gray-300 pl-1"
                    style={{ width: `${(segment.duration / Math.max(...ganttChart.map(g => g.endTime))) * 100}%` }}
                  >
                    <span>{segment.startTime}</span>
                    {index === ganttChart.length - 1 && <span>{segment.endTime}</span>}
                  </div>
                ))}
              </div>

              {/* Current time indicator */}
              {isAnimating && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10 transition-all duration-200"
                  style={{ 
                    left: `${(currentTime / Math.max(...ganttChart.map(g => g.endTime))) * 100}%` 
                  }}
                >
                  <div className="absolute -top-6 -left-8 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                    {currentTime.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Avg Waiting Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.avgWaitingTime}ms</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Avg Turnaround</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{metrics.avgTurnaroundTime}ms</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-purple-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Avg Response</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{metrics.avgResponseTime}ms</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-red-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Total Time</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{metrics.totalTime}ms</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-yellow-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Throughput</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{metrics.throughput}</div>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Algorithm Characteristics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'FCFS', pros: 'Simple implementation', cons: 'Convoy effect', bestFor: 'Batch systems' },
            { name: 'SJF', pros: 'Optimal waiting time', cons: 'Starvation possible', bestFor: 'Known burst times' },
            { name: 'RR', pros: 'Fair scheduling', cons: 'Context switching overhead', bestFor: 'Interactive systems' },
            { name: 'Priority', pros: 'Important jobs first', cons: 'Starvation of low priority', bestFor: 'Real-time systems' }
          ].map((alg) => (
            <div key={alg.name} className={`p-4 rounded-lg border-2 ${algorithm === alg.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <h3 className="font-bold text-gray-800 mb-2">{alg.name}</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-green-600 font-medium">✓</span> {alg.pros}</div>
                <div><span className="text-red-600 font-medium">✗</span> {alg.cons}</div>
                <div><span className="text-blue-600 font-medium">⚡</span> {alg.bestFor}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CPUSchedulingSimulator;