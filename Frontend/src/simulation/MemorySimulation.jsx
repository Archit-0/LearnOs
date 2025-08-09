import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertCircle, Monitor, HardDrive, Cpu } from 'lucide-react';

const MemoryManagementSimulation = () => {
  const [currentTab, setCurrentTab] = useState('intro');
  const [memoryType, setMemoryType] = useState('paging');
  const [isRunning, setIsRunning] = useState(false);
  const [physicalMemory, setPhysicalMemory] = useState([]);
  const [pageTable, setPageTable] = useState([]);
  const [segmentTable, setSegmentTable] = useState([]);
  const [pageFaults, setPageFaults] = useState(0);
  const [memoryAccesses, setMemoryAccesses] = useState(0);
  const [hitRatio, setHitRatio] = useState(100);
  const [processes, setProcesses] = useState([]);
  const [accessHistory, setAccessHistory] = useState([]);
  const [tlbHits, setTlbHits] = useState(0);

  // Initialize memory management system
  const initializeMemorySystem = useCallback(() => {
    // Physical memory frames (16 frames of 4KB each = 64KB total)
    const physMem = Array(16).fill(null).map((_, i) => ({
      frame: i,
      process: null,
      page: null,
      accessed: false,
      modified: false,
      loadTime: 0,
      color: 'bg-gray-200'
    }));

    // Processes with memory requirements
    const procs = [
      { id: 1, name: 'Text Editor', size: 12, pages: 3, color: 'bg-blue-500', segments: [
        { name: 'Code', size: 4, base: 0, permissions: 'R-X' },
        { name: 'Data', size: 4, base: 4, permissions: 'RW-' },
        { name: 'Stack', size: 4, base: 8, permissions: 'RW-' }
      ]},
      { id: 2, name: 'Web Browser', size: 20, pages: 5, color: 'bg-green-500', segments: [
        { name: 'Code', size: 8, base: 12, permissions: 'R-X' },
        { name: 'Data', size: 8, base: 20, permissions: 'RW-' },
        { name: 'Heap', size: 4, base: 28, permissions: 'RW-' }
      ]},
      { id: 3, name: 'Game Engine', size: 16, pages: 4, color: 'bg-purple-500', segments: [
        { name: 'Code', size: 6, base: 32, permissions: 'R-X' },
        { name: 'Graphics', size: 6, base: 38, permissions: 'RW-' },
        { name: 'Audio', size: 4, base: 44, permissions: 'RW-' }
      ]}
    ];

    // Page table entries
    const pageTab = [];
    procs.forEach(proc => {
      for (let i = 0; i < proc.pages; i++) {
        pageTab.push({
          id: pageTab.length,
          process: proc.id,
          processName: proc.name,
          virtualPage: i,
          physicalFrame: null,
          valid: false,
          dirty: false,
          referenced: false,
          protection: 'RW'
        });
      }
    });

    setPhysicalMemory(physMem);
    setPageTable(pageTab);
    setProcesses(procs);
    setSegmentTable(procs.flatMap(p => p.segments.map(s => ({ ...s, process: p.id, processName: p.name }))));
    setPageFaults(0);
    setMemoryAccesses(0);
    setAccessHistory([]);
    setHitRatio(100);
    setTlbHits(0);
  }, []);

  // Simulate memory access
  const simulateMemoryAccess = useCallback((processId, virtualAddress) => {
    setMemoryAccesses(prev => prev + 1);
    const access = { processId, virtualAddress, time: Date.now(), hit: false, type: 'miss' };

    const pageSize = 4; // KB
    const pageNumber = Math.floor(virtualAddress / pageSize);
    const pageEntry = pageTable.find(p => p.process === processId && p.virtualPage === pageNumber);

    if (pageEntry && pageEntry.valid) {
      // Page hit
      access.hit = true;
      access.type = 'hit';
      setTlbHits(prev => prev + 1);
      
      setPageTable(prev => prev.map(p => 
        p.id === pageEntry.id ? { ...p, referenced: true } : p
      ));
      setPhysicalMemory(prev => prev.map(f => 
        f.frame === pageEntry.physicalFrame ? { ...f, accessed: true } : f
      ));
    } else {
      // Page fault
      setPageFaults(prev => prev + 1);
      access.hit = false;
      access.type = 'fault';
      
      // Find free frame or use FIFO replacement
      const freeFrame = physicalMemory.find(f => f.process === null);
      const targetFrame = freeFrame ? freeFrame.frame : 
        physicalMemory.reduce((oldest, current) => 
          current.loadTime < oldest.loadTime ? current : oldest
        ).frame;

      // Update page table and physical memory
      setPageTable(prev => prev.map(p => {
        if (p.id === pageEntry?.id) {
          return { ...p, valid: true, physicalFrame: targetFrame, referenced: true };
        }
        // Invalidate page that was replaced
        if (p.physicalFrame === targetFrame && p.valid) {
          return { ...p, valid: false, physicalFrame: null };
        }
        return p;
      }));

      const proc = processes.find(p => p.id === processId);
      setPhysicalMemory(prev => prev.map(f => 
        f.frame === targetFrame ? {
          ...f,
          process: processId,
          page: pageNumber,
          accessed: true,
          loadTime: Date.now(),
          color: proc?.color || 'bg-gray-500'
        } : f
      ));
    }

    setAccessHistory(prev => [access, ...prev.slice(0, 9)]);
    
    // Update hit ratio
    setTimeout(() => {
      const newHitRatio = ((memoryAccesses + 1 - pageFaults) / Math.max(memoryAccesses + 1, 1)) * 100;
      setHitRatio(newHitRatio);
    }, 100);
  }, [pageTable, physicalMemory, memoryAccesses, pageFaults, processes]);

  // Auto simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (processes.length > 0) {
        const randomProcess = processes[Math.floor(Math.random() * processes.length)];
        const randomAddress = Math.floor(Math.random() * randomProcess.size);
        simulateMemoryAccess(randomProcess.id, randomAddress);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunning, processes, simulateMemoryAccess]);

  const loadProcessIntoMemory = (processId) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return;

    // Load first few pages
    for (let i = 0; i < Math.min(process.pages, 3); i++) {
      simulateMemoryAccess(processId, i * 4);
    }
  };

  useEffect(() => {
    initializeMemorySystem();
  }, [initializeMemorySystem]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Memory Management Simulation
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
            onClick={() => setCurrentTab('paging')}
            className={`px-4 py-2 font-medium ${currentTab === 'paging' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Paging System
          </button>
          <button
            onClick={() => setCurrentTab('segmentation')}
            className={`px-4 py-2 font-medium ${currentTab === 'segmentation' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Segmentation
          </button>
          <button
            onClick={() => setCurrentTab('virtual')}
            className={`px-4 py-2 font-medium ${currentTab === 'virtual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Virtual Memory
          </button>
        </div>

        {/* Introduction Tab */}
        {currentTab === 'intro' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Monitor className="mr-3 text-blue-600" />
                Memory Management Overview
              </h2>
              <p className="text-gray-700 mb-4">
                Memory management is a crucial function of the operating system that handles the allocation, 
                deallocation, and organization of memory resources. It ensures efficient use of available memory 
                and provides each process with the illusion of having its own dedicated memory space.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                  <h3 className="font-bold mb-2">Paging</h3>
                  <p className="text-sm text-gray-600">
                    Divides memory into fixed-size pages for efficient allocation and virtual memory support
                  </p>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-green-500">
                  <h3 className="font-bold mb-2">Segmentation</h3>
                  <p className="text-sm text-gray-600">
                    Divides memory into logical segments based on program structure (code, data, stack)
                  </p>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-purple-500">
                  <h3 className="font-bold mb-2">Virtual Memory</h3>
                  <p className="text-sm text-gray-600">
                    Provides illusion of larger memory than physically available using secondary storage
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Key Memory Management Concepts</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <strong>Physical Memory:</strong> Actual RAM available in the system
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <strong>Virtual Memory:</strong> Abstraction that gives processes larger address space
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <strong>Page Fault:</strong> Exception when accessing non-resident page
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <strong>Page Table:</strong> Maps virtual pages to physical frames
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <strong>TLB:</strong> Translation Lookaside Buffer for fast address translation
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <strong>Swapping:</strong> Moving pages between memory and disk
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Memory Allocation Strategies</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold mb-3 text-blue-600">Contiguous Allocation</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Single partition allocation</li>
                    <li>• Multiple partition allocation</li>
                    <li>• First fit, best fit, worst fit algorithms</li>
                    <li>• External fragmentation issues</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-green-600">Non-Contiguous Allocation</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Paging system</li>
                    <li>• Segmentation system</li>
                    <li>• Segmented paging</li>
                    <li>• Eliminates external fragmentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paging Tab */}
        {currentTab === 'paging' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <HardDrive className="mr-3 text-blue-600" />
                Paging System Simulation
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded font-medium flex items-center ${
                    isRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isRunning ? 'Pause' : 'Start Auto'}
                </button>
                <button
                  onClick={initializeMemorySystem}
                  className="px-4 py-2 bg-gray-500 text-white rounded font-medium flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>

            {/* Memory Statistics */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-bold">Memory Accesses</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{memoryAccesses}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-bold">Page Faults</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{pageFaults}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Monitor className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-bold">Hit Ratio</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{hitRatio.toFixed(1)}%</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Cpu className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-bold">TLB Hits</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{tlbHits}</div>
              </div>
            </div>

            {/* Process Controls */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-3">Load Processes into Memory</h3>
              <div className="flex space-x-3">
                {processes.map(proc => (
                  <button
                    key={proc.id}
                    onClick={() => loadProcessIntoMemory(proc.id)}
                    className={`px-4 py-2 ${proc.color} text-white rounded font-medium`}
                  >
                    Load {proc.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const randomProcess = processes[Math.floor(Math.random() * processes.length)];
                    const randomAddress = Math.floor(Math.random() * randomProcess.size);
                    simulateMemoryAccess(randomProcess.id, randomAddress);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded font-medium"
                >
                  Random Access
                </button>
              </div>
            </div>

            {/* Physical Memory Visualization */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Physical Memory (RAM) - 16 Frames × 4KB = 64KB</h3>
              <div className="grid grid-cols-8 gap-2">
                {physicalMemory.map(frame => (
                  <div
                    key={frame.frame}
                    className={`h-20 rounded border-2 flex flex-col items-center justify-center text-xs ${
                      frame.process ? frame.color : 'bg-gray-200 border-gray-300'
                    } ${frame.accessed ? 'ring-2 ring-yellow-400' : ''} transition-all duration-300`}
                  >
                    <div className={`font-bold ${frame.process ? 'text-white' : 'text-gray-600'}`}>F{frame.frame}</div>
                    {frame.process && (
                      <>
                        <div className="text-white text-xs">P{frame.process}</div>
                        <div className="text-white text-xs">Pg{frame.page}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Yellow ring indicates recently accessed frame. Each frame is 4KB.
              </div>
            </div>

            {/* Page Table */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Page Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Process</th>
                      <th className="p-2 text-left">Virtual Page</th>
                      <th className="p-2 text-left">Physical Frame</th>
                      <th className="p-2 text-left">Valid</th>
                      <th className="p-2 text-left">Referenced</th>
                      <th className="p-2 text-left">Dirty</th>
                      <th className="p-2 text-left">Protection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageTable.slice(0, 12).map(entry => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{entry.processName}</td>
                        <td className="p-2">{entry.virtualPage}</td>
                        <td className="p-2">{entry.physicalFrame ?? 'N/A'}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${entry.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {entry.valid ? 'Valid' : 'Invalid'}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`w-3 h-3 rounded-full inline-block ${entry.referenced ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                        </td>
                        <td className="p-2">
                          <span className={`w-3 h-3 rounded-full inline-block ${entry.dirty ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                        </td>
                        <td className="p-2 font-mono">{entry.protection}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Memory Access History */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Recent Memory Accesses</h3>
              <div className="space-y-2">
                {accessHistory.map((access, index) => (
                  <div key={index} className={`p-3 rounded border-l-4 ${access.hit ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Process {access.processId} → Virtual Address {access.virtualAddress}KB
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        access.hit ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {access.hit ? 'HIT' : 'FAULT'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paging Explanation */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">How Paging Works</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Paging divides both virtual and physical memory into fixed-size blocks called pages and frames respectively. 
                  The page table maintains the mapping between virtual pages and physical frames.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-bold mb-2">Advantages:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• No external fragmentation</li>
                      <li>• Simple memory allocation</li>
                      <li>• Supports virtual memory</li>
                      <li>• Protection between processes</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-bold mb-2">Disadvantages:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Internal fragmentation</li>
                      <li>• Page table overhead</li>
                      <li>• Translation overhead</li>
                      <li>• Page fault handling cost</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Segmentation Tab */}
        {currentTab === 'segmentation' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <Monitor className="mr-3 text-green-600" />
                Segmentation System
              </h2>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">What is Segmentation?</h3>
              <p className="text-gray-700 mb-4">
                Segmentation divides a program's address space into logical segments such as code, data, and stack. 
                Each segment can grow independently and has different protection attributes. This reflects the 
                logical structure of the program better than paging.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                  <h4 className="font-bold mb-2">Code Segment</h4>
                  <p className="text-sm text-gray-600">Contains executable instructions (Read + Execute permissions)</p>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-green-500">
                  <h4 className="font-bold mb-2">Data Segment</h4>
                  <p className="text-sm text-gray-600">Contains global variables and static data (Read + Write permissions)</p>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-purple-500">
                  <h4 className="font-bold mb-2">Stack Segment</h4>
                  <p className="text-sm text-gray-600">Contains local variables and function calls (Read + Write permissions)</p>
                </div>
              </div>
            </div>

            {/* Segment Table */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Segment Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-left">Process</th>
                      <th className="p-3 text-left">Segment</th>
                      <th className="p-3 text-left">Base Address</th>
                      <th className="p-3 text-left">Size (KB)</th>
                      <th className="p-3 text-left">Limit</th>
                      <th className="p-3 text-left">Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentTable.map((segment, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">{segment.processName}</td>
                        <td className="p-3 font-medium">{segment.name}</td>
                        <td className="p-3 font-mono">{segment.base}KB</td>
                        <td className="p-3">{segment.size}KB</td>
                        <td className="p-3 font-mono">{segment.base + segment.size - 1}KB</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            segment.permissions.includes('X') ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {segment.permissions}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Segmentation Visualization */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Memory Layout by Segments</h3>
              <div className="space-y-4">
                {processes.map(proc => (
                  <div key={proc.id} className="bg-white p-4 rounded border">
                    <h4 className="font-bold mb-3">{proc.name} (Process {proc.id})</h4>
                    <div className="flex space-x-2">
                      {proc.segments.map((segment, idx) => (
                        <div
                          key={idx}
                          className={`${proc.color} text-white p-3 rounded flex-1 text-center min-w-20`}
                          style={{flexBasis: `${(segment.size / proc.size) * 100}%`}}
                        >
                          <div className="font-bold">{segment.name}</div>
                          <div className="text-xs">{segment.size}KB</div>
                          <div className="text-xs">{segment.permissions}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Segmentation vs Paging Comparison */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Segmentation vs Paging</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded">
                  <h4 className="font-bold mb-3 text-green-600">Segmentation Advantages</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Logical organization matches program structure</li>
                    <li>• Different protection for different segments</li>
                    <li>• Facilitates sharing of code segments</li>
                    <li>• Dynamic segment growth</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded">
                  <h4 className="font-bold mb-3 text-red-600">Segmentation Disadvantages</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• External fragmentation</li>
                    <li>• Complex memory allocation</li>
                    <li>• Segment table overhead</li>
                    <li>• Difficult to implement virtual memory</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Virtual Memory Tab */}
        {currentTab === 'virtual' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <HardDrive className="mr-3 text-purple-600" />
                Virtual Memory System
              </h2>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Virtual Memory Concepts</h3>
              <p className="text-gray-700 mb-4">
                Virtual memory allows the execution of processes that may not be completely in physical memory. 
                It provides the illusion of a very large memory space by using secondary storage as an extension of main memory.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                  <h4 className="font-bold mb-2">Benefits</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Larger address space than physical memory</li>
                    <li>• Better multiprogramming</li>
                    <li>• Process isolation and protection</li>
                    <li>• Efficient memory utilization</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-red-500">
                  <h4 className="font-bold mb-2">Implementation</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Demand paging</li>
                    <li>• Page replacement algorithms</li>
                    <li>• Working set management</li>
                    <li>• Thrashing prevention</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Virtual vs Physical Memory Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Virtual Address Space</h3>
                <div className="space-y-2">
                  {processes.map(proc => (
                    <div key={proc.id} className="bg-white p-3 rounded border">
                      <div className="font-bold mb-2">{proc.name}</div>
                      <div className="text-sm text-gray-600 mb-2">Virtual Size: {proc.size}KB ({proc.pages} pages)</div>
                      <div className="flex space-x-1">
                        {Array(proc.pages).fill(0).map((_, idx) => (
                          <div key={idx} className={`${proc.color} text-white p-2 rounded text-xs text-center flex-1`}>
                            VP{idx}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Physical Memory Usage</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Memory Utilization</span>
                    <span>{Math.round((physicalMemory.filter(f => f.process !== null).length / physicalMemory.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                      style={{width: `${(physicalMemory.filter(f => f.process !== null).length / physicalMemory.length) * 100}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Frames in Use:</div>
                  {processes.map(proc => {
                    const framesUsed = physicalMemory.filter(f => f.process === proc.id).length;
                    return framesUsed > 0 && (
                      <div key={proc.id} className="flex items-center justify-between bg-white p-2 rounded">
                        <span className="text-sm">{proc.name}</span>
                        <span className={`px-2 py-1 ${proc.color} text-white rounded text-xs`}>
                          {framesUsed} frames
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Page Replacement Algorithms */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Page Replacement Algorithms</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                  <h4 className="font-bold mb-2">FIFO</h4>
                  <p className="text-sm text-gray-600">
                    First In, First Out - Replace the oldest page in memory
                  </p>
                  <div className="mt-2 text-xs text-blue-600 font-medium">Currently Used</div>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-green-500">
                  <h4 className="font-bold mb-2">LRU</h4>
                  <p className="text-sm text-gray-600">
                    Least Recently Used - Replace the page that hasn't been accessed for the longest time
                  </p>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-purple-500">
                  <h4 className="font-bold mb-2">Optimal</h4>
                  <p className="text-sm text-gray-600">
                    Replace the page that will not be used for the longest time in the future
                  </p>
                </div>
              </div>
            </div>

            {/* Thrashing Explanation */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <AlertCircle className="mr-3 text-red-600" />
                Thrashing
              </h3>
              <p className="text-gray-700 mb-4">
                Thrashing occurs when a system spends more time paging than executing processes. 
                This happens when there are too many processes competing for limited physical memory.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded">
                  <h4 className="font-bold mb-2">Causes:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Too many processes in memory</li>
                    <li>• Insufficient physical memory</li>
                    <li>• Poor locality of reference</li>
                    <li>• Inadequate working set size</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded">
                  <h4 className="font-bold mb-2">Solutions:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Reduce degree of multiprogramming</li>
                    <li>• Increase physical memory</li>
                    <li>• Use working set model</li>
                    <li>• Implement page fault frequency control</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Learning Summary */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold mb-3">Learning Objectives Summary</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-bold mb-2">Paging Mastery</h4>
              <p className="text-gray-700">Understand page tables, address translation, and page fault handling</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-bold mb-2">Segmentation Knowledge</h4>
              <p className="text-gray-700">Learn logical memory organization and segment-based protection</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-bold mb-2">Virtual Memory Concepts</h4>
              <p className="text-gray-700">Grasp demand paging, replacement algorithms, and performance optimization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryManagementSimulation;