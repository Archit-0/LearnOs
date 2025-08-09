const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// CPU Scheduling Simulator
router.post('/cpu-scheduling', auth, async (req, res) => {
  try {
    const { algorithm, processes } = req.body;

    if (!algorithm || !processes || !Array.isArray(processes)) {
      return res.status(400).json({ message: 'Algorithm and processes are required' });
    }

    let result = {};

    switch (algorithm.toLowerCase()) {
      case 'fcfs':
        result = simulateFCFS(processes);
        break;
      case 'sjf':
        result = simulateSJF(processes);
        break;
      case 'round-robin':
      case 'rr':
        const timeQuantum = req.body.timeQuantum || 2;
        result = simulateRoundRobin(processes, timeQuantum);
        break;
      case 'priority':
        result = simulatePriority(processes);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported algorithm' });
    }

    res.json(result);
  } catch (error) {
    console.error('CPU Scheduling simulation error:', error);
    res.status(500).json({ message: 'Simulation error' });
  }
});

// Memory Allocation Simulator
router.post('/memory-allocation', auth, async (req, res) => {
  try {
    const { algorithm, memorySize, processes } = req.body;

    if (!algorithm || !memorySize || !processes) {
      return res.status(400).json({ message: 'Algorithm, memory size, and processes are required' });
    }

    let result = {};

    switch (algorithm.toLowerCase()) {
      case 'first-fit':
        result = simulateFirstFit(memorySize, processes);
        break;
      case 'best-fit':
        result = simulateBestFit(memorySize, processes);
        break;
      case 'worst-fit':
        result = simulateWorstFit(memorySize, processes);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported algorithm' });
    }

    res.json(result);
  } catch (error) {
    console.error('Memory allocation simulation error:', error);
    res.status(500).json({ message: 'Simulation error' });
  }
});

// Page Replacement Simulator
router.post('/page-replacement', auth, async (req, res) => {
  try {
    const { algorithm, pageFrames, referenceString } = req.body;

    if (!algorithm || !pageFrames || !referenceString) {
      return res.status(400).json({ message: 'Algorithm, page frames, and reference string are required' });
    }

    let result = {};

    switch (algorithm.toLowerCase()) {
      case 'fifo':
        result = simulateFIFO(pageFrames, referenceString);
        break;
      case 'lru':
        result = simulateLRU(pageFrames, referenceString);
        break;
      case 'optimal':
        result = simulateOptimal(pageFrames, referenceString);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported algorithm' });
    }

    res.json(result);
  } catch (error) {
    console.error('Page replacement simulation error:', error);
    res.status(500).json({ message: 'Simulation error' });
  }
});

// CPU Scheduling Algorithms Implementation
function simulateFCFS(processes) {
  const result = {
    ganttChart: [],
    processResults: [],
    averageWaitingTime: 0,
    averageTurnaroundTime: 0
  };

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  // Sort by arrival time
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

  sortedProcesses.forEach((process) => {
    const startTime = Math.max(currentTime, process.arrivalTime);
    const endTime = startTime + process.burstTime;
    const waitingTime = startTime - process.arrivalTime;
    const turnaroundTime = endTime - process.arrivalTime;

    result.ganttChart.push({
      processId: process.id,
      startTime,
      endTime,
      duration: process.burstTime
    });

    result.processResults.push({
      processId: process.id,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      startTime,
      endTime,
      waitingTime,
      turnaroundTime
    });

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;
  });

  result.averageWaitingTime = totalWaitingTime / processes.length;
  result.averageTurnaroundTime = totalTurnaroundTime / processes.length;

  return result;
}

function simulateSJF(processes) {
  const result = {
    ganttChart: [],
    processResults: [],
    averageWaitingTime: 0,
    averageTurnaroundTime: 0
  };

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  const remainingProcesses = [...processes];
  const completedProcesses = [];

  while (remainingProcesses.length > 0) {
    // Find processes that have arrived
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      // No process available, jump to next arrival
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }

    // Select shortest job
    const shortestJob = availableProcesses.reduce((prev, curr) => 
      prev.burstTime < curr.burstTime ? prev : curr
    );

    const startTime = currentTime;
    const endTime = startTime + shortestJob.burstTime;
    const waitingTime = startTime - shortestJob.arrivalTime;
    const turnaroundTime = endTime - shortestJob.arrivalTime;

    result.ganttChart.push({
      processId: shortestJob.id,
      startTime,
      endTime,
      duration: shortestJob.burstTime
    });

    completedProcesses.push({
      processId: shortestJob.id,
      arrivalTime: shortestJob.arrivalTime,
      burstTime: shortestJob.burstTime,
      startTime,
      endTime,
      waitingTime,
      turnaroundTime
    });

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;

    // Remove completed process
    const index = remainingProcesses.findIndex(p => p.id === shortestJob.id);
    remainingProcesses.splice(index, 1);
  }

  result.processResults = completedProcesses;
  result.averageWaitingTime = totalWaitingTime / processes.length;
  result.averageTurnaroundTime = totalTurnaroundTime / processes.length;

  return result;
}

function simulateRoundRobin(processes, timeQuantum) {
  const result = {
    ganttChart: [],
    processResults: [],
    averageWaitingTime: 0,
    averageTurnaroundTime: 0,
    timeQuantum
  };

  let currentTime = 0;
  const queue = [];
  const remainingTime = {};
  const waitingTime = {};
  const turnaroundTime = {};

  // Initialize remaining times and waiting times
  processes.forEach(p => {
    remainingTime[p.id] = p.burstTime;
    waitingTime[p.id] = 0;
  });

  // Add processes to queue based on arrival time
  let processIndex = 0;
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

  // Add first process
  if (sortedProcesses.length > 0) {
    queue.push(sortedProcesses[0]);
    processIndex = 1;
  }

  while (queue.length > 0) {
    const currentProcess = queue.shift();
    const executeTime = Math.min(timeQuantum, remainingTime[currentProcess.id]);
    
    result.ganttChart.push({
      processId: currentProcess.id,
      startTime: currentTime,
      endTime: currentTime + executeTime,
      duration: executeTime
    });

    currentTime += executeTime;
    remainingTime[currentProcess.id] -= executeTime;

    // Add newly arrived processes to queue
    while (processIndex < sortedProcesses.length && 
           sortedProcesses[processIndex].arrivalTime <= currentTime) {
      queue.push(sortedProcesses[processIndex]);
      processIndex++;
    }

    // If process is completed
    if (remainingTime[currentProcess.id] === 0) {
      turnaroundTime[currentProcess.id] = currentTime - currentProcess.arrivalTime;
      waitingTime[currentProcess.id] = turnaroundTime[currentProcess.id] - currentProcess.burstTime;
    } else {
      // Add back to queue if not completed
      queue.push(currentProcess);
    }
  }

  // Calculate results
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  processes.forEach(process => {
    result.processResults.push({
      processId: process.id,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      waitingTime: waitingTime[process.id],
      turnaroundTime: turnaroundTime[process.id]
    });

    totalWaitingTime += waitingTime[process.id];
    totalTurnaroundTime += turnaroundTime[process.id];
  });

  result.averageWaitingTime = totalWaitingTime / processes.length;
  result.averageTurnaroundTime = totalTurnaroundTime / processes.length;

  return result;
}

function simulatePriority(processes) {
  // Similar to SJF but using priority instead of burst time
  const result = {
    ganttChart: [],
    processResults: [],
    averageWaitingTime: 0,
    averageTurnaroundTime: 0
  };

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  const remainingProcesses = [...processes];
  const completedProcesses = [];

  while (remainingProcesses.length > 0) {
    const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
    
    if (availableProcesses.length === 0) {
      currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      continue;
    }

    // Select highest priority (lower number = higher priority)
    const highestPriority = availableProcesses.reduce((prev, curr) => 
      prev.priority < curr.priority ? prev : curr
    );

    const startTime = currentTime;
    const endTime = startTime + highestPriority.burstTime;
    const waitingTime = startTime - highestPriority.arrivalTime;
    const turnaroundTime = endTime - highestPriority.arrivalTime;

    result.ganttChart.push({
      processId: highestPriority.id,
      startTime,
      endTime,
      duration: highestPriority.burstTime
    });

    completedProcesses.push({
      processId: highestPriority.id,
      arrivalTime: highestPriority.arrivalTime,
      burstTime: highestPriority.burstTime,
      priority: highestPriority.priority,
      startTime,
      endTime,
      waitingTime,
      turnaroundTime
    });

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;

    const index = remainingProcesses.findIndex(p => p.id === highestPriority.id);
    remainingProcesses.splice(index, 1);
  }

  result.processResults = completedProcesses;
  result.averageWaitingTime = totalWaitingTime / processes.length;
  result.averageTurnaroundTime = totalTurnaroundTime / processes.length;

  return result;
}

// Memory Allocation Algorithms
function simulateFirstFit(memorySize, processes) {
  const memory = Array(memorySize).fill(null);
  const allocations = [];
  const failures = [];

  processes.forEach(process => {
    let allocated = false;
    let consecutiveCount = 0;
    let startIndex = -1;

    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        if (consecutiveCount === 0) startIndex = i;
        consecutiveCount++;
        
        if (consecutiveCount >= process.size) {
          // Allocate memory
          for (let j = startIndex; j < startIndex + process.size; j++) {
            memory[j] = process.id;
          }
          
          allocations.push({
            processId: process.id,
            size: process.size,
            startAddress: startIndex,
            endAddress: startIndex + process.size - 1,
            allocated: true
          });
          
          allocated = true;
          break;
        }
      } else {
        consecutiveCount = 0;
      }
    }

    if (!allocated) {
      failures.push({
        processId: process.id,
        size: process.size,
        allocated: false,
        reason: 'Insufficient contiguous memory'
      });
    }
  });

  // Calculate fragmentation
  const freeBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === null) {
      if (!currentBlock) {
        currentBlock = { start: i, size: 1 };
      } else {
        currentBlock.size++;
      }
    } else {
      if (currentBlock) {
        freeBlocks.push(currentBlock);
        currentBlock = null;
      }
    }
  }
  if (currentBlock) freeBlocks.push(currentBlock);

  const totalFreeSpace = freeBlocks.reduce((sum, block) => sum + block.size, 0);
  const externalFragmentation = freeBlocks.length > 0 ? 
    totalFreeSpace - Math.max(...freeBlocks.map(b => b.size), 0) : 0;

  return {
    algorithm: 'First Fit',
    memoryState: memory,
    allocations: [...allocations, ...failures],
    freeBlocks,
    statistics: {
      totalMemory: memorySize,
      allocatedMemory: memorySize - totalFreeSpace,
      freeMemory: totalFreeSpace,
      externalFragmentation,
      successfulAllocations: allocations.length,
      failedAllocations: failures.length
    }
  };
}

function simulateBestFit(memorySize, processes) {
  const memory = Array(memorySize).fill(null);
  const allocations = [];
  const failures = [];

  processes.forEach(process => {
    // Find all free blocks
    const freeBlocks = [];
    let currentBlock = null;

    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        if (!currentBlock) {
          currentBlock = { start: i, size: 1 };
        } else {
          currentBlock.size++;
        }
      } else {
        if (currentBlock && currentBlock.size >= process.size) {
          freeBlocks.push(currentBlock);
        }
        currentBlock = null;
      }
    }
    if (currentBlock && currentBlock.size >= process.size) {
      freeBlocks.push(currentBlock);
    }

    if (freeBlocks.length > 0) {
      // Find best fit (smallest block that can accommodate the process)
      const bestBlock = freeBlocks.reduce((best, current) => 
        current.size < best.size ? current : best
      );

      // Allocate memory
      for (let j = bestBlock.start; j < bestBlock.start + process.size; j++) {
        memory[j] = process.id;
      }

      allocations.push({
        processId: process.id,
        size: process.size,
        startAddress: bestBlock.start,
        endAddress: bestBlock.start + process.size - 1,
        allocated: true,
        blockSize: bestBlock.size
      });
    } else {
      failures.push({
        processId: process.id,
        size: process.size,
        allocated: false,
        reason: 'No suitable block found'
      });
    }
  });

  // Calculate statistics similar to First Fit
  const freeBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === null) {
      if (!currentBlock) {
        currentBlock = { start: i, size: 1 };
      } else {
        currentBlock.size++;
      }
    } else {
      if (currentBlock) {
        freeBlocks.push(currentBlock);
        currentBlock = null;
      }
    }
  }
  if (currentBlock) freeBlocks.push(currentBlock);

  const totalFreeSpace = freeBlocks.reduce((sum, block) => sum + block.size, 0);

  return {
    algorithm: 'Best Fit',
    memoryState: memory,
    allocations: [...allocations, ...failures],
    freeBlocks,
    statistics: {
      totalMemory: memorySize,
      allocatedMemory: memorySize - totalFreeSpace,
      freeMemory: totalFreeSpace,
      successfulAllocations: allocations.length,
      failedAllocations: failures.length
    }
  };
}

function simulateWorstFit(memorySize, processes) {
  // Similar to Best Fit but selects the largest available block
  const memory = Array(memorySize).fill(null);
  const allocations = [];
  const failures = [];

  processes.forEach(process => {
    const freeBlocks = [];
    let currentBlock = null;

    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        if (!currentBlock) {
          currentBlock = { start: i, size: 1 };
        } else {
          currentBlock.size++;
        }
      } else {
        if (currentBlock && currentBlock.size >= process.size) {
          freeBlocks.push(currentBlock);
        }
        currentBlock = null;
      }
    }
    if (currentBlock && currentBlock.size >= process.size) {
      freeBlocks.push(currentBlock);
    }

    if (freeBlocks.length > 0) {
      // Find worst fit (largest block)
      const worstBlock = freeBlocks.reduce((worst, current) => 
        current.size > worst.size ? current : worst
      );

      // Allocate memory
      for (let j = worstBlock.start; j < worstBlock.start + process.size; j++) {
        memory[j] = process.id;
      }

      allocations.push({
        processId: process.id,
        size: process.size,
        startAddress: worstBlock.start,
        endAddress: worstBlock.start + process.size - 1,
        allocated: true,
        blockSize: worstBlock.size
      });
    } else {
      failures.push({
        processId: process.id,
        size: process.size,
        allocated: false,
        reason: 'No suitable block found'
      });
    }
  });

  // Calculate statistics
  const freeBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === null) {
      if (!currentBlock) {
        currentBlock = { start: i, size: 1 };
      } else {
        currentBlock.size++;
      }
    } else {
      if (currentBlock) {
        freeBlocks.push(currentBlock);
        currentBlock = null;
      }
    }
  }
  if (currentBlock) freeBlocks.push(currentBlock);

  const totalFreeSpace = freeBlocks.reduce((sum, block) => sum + block.size, 0);

  return {
    algorithm: 'Worst Fit',
    memoryState: memory,
    allocations: [...allocations, ...failures],
    freeBlocks,
    statistics: {
      totalMemory: memorySize,
      allocatedMemory: memorySize - totalFreeSpace,
      freeMemory: totalFreeSpace,
      successfulAllocations: allocations.length,
      failedAllocations: failures.length
    }
  };
}

// Page Replacement Algorithms
function simulateFIFO(pageFrames, referenceString) {
  const frames = Array(pageFrames).fill(null);
  const steps = [];
  let pageFaults = 0;
  let hits = 0;
  let pointer = 0;

  referenceString.forEach((page, index) => {
    const framesCopy = [...frames];
    let isHit = frames.includes(page);

    if (isHit) {
      hits++;
    } else {
      pageFaults++;
      frames[pointer] = page;
      pointer = (pointer + 1) % pageFrames;
    }

    steps.push({
      step: index + 1,
      page: page,
      frames: [...frames],
      isHit: isHit,
      isFault: !isHit,
      replacedPage: !isHit && framesCopy[pointer % pageFrames] !== null ? 
        framesCopy[pointer % pageFrames] : null
    });
  });

  return {
    algorithm: 'FIFO',
    pageFrames,
    referenceString,
    steps,
    statistics: {
      totalReferences: referenceString.length,
      pageFaults,
      pageHits: hits,
      hitRatio: (hits / referenceString.length * 100).toFixed(2) + '%',
      faultRatio: (pageFaults / referenceString.length * 100).toFixed(2) + '%'
    }
  };
}

function simulateLRU(pageFrames, referenceString) {
  const frames = [];
  const steps = [];
  let pageFaults = 0;
  let hits = 0;

  referenceString.forEach((page, index) => {
    let isHit = false;
    let replacedPage = null;

    // Check if page is already in frames
    const existingIndex = frames.findIndex(frame => frame.page === page);
    
    if (existingIndex !== -1) {
      // Hit - update last used time
      frames[existingIndex].lastUsed = index;
      isHit = true;
      hits++;
    } else {
      // Miss - page fault
      pageFaults++;
      
      if (frames.length < pageFrames) {
        // Frame available
        frames.push({ page: page, lastUsed: index });
      } else {
        // Replace LRU page
        const lruIndex = frames.reduce((minIndex, current, currentIndex) => 
          current.lastUsed < frames[minIndex].lastUsed ? currentIndex : minIndex, 0);
        
        replacedPage = frames[lruIndex].page;
        frames[lruIndex] = { page: page, lastUsed: index };
      }
    }

    steps.push({
      step: index + 1,
      page: page,
      frames: frames.map(f => f.page),
      isHit: isHit,
      isFault: !isHit,
      replacedPage: replacedPage
    });
  });

  return {
    algorithm: 'LRU',
    pageFrames,
    referenceString,
    steps,
    statistics: {
      totalReferences: referenceString.length,
      pageFaults,
      pageHits: hits,
      hitRatio: (hits / referenceString.length * 100).toFixed(2) + '%',
      faultRatio: (pageFaults / referenceString.length * 100).toFixed(2) + '%'
    }
  };
}

function simulateOptimal(pageFrames, referenceString) {
  const frames = Array(pageFrames).fill(null);
  const steps = [];
  let pageFaults = 0;
  let hits = 0;

  referenceString.forEach((page, index) => {
    let isHit = frames.includes(page);
    let replacedPage = null;

    if (isHit) {
      hits++;
    } else {
      pageFaults++;
      
      // Find empty frame
      const emptyIndex = frames.indexOf(null);
      
      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
      } else {
        // Find optimal page to replace
        let replaceIndex = 0;
        let farthestNext = -1;

        frames.forEach((framePage, frameIndex) => {
          // Find when this page will be used next
          let nextUse = referenceString.length; // Default to end if not found
          
          for (let i = index + 1; i < referenceString.length; i++) {
            if (referenceString[i] === framePage) {
              nextUse = i;
              break;
            }
          }

          if (nextUse > farthestNext) {
            farthestNext = nextUse;
            replaceIndex = frameIndex;
          }
        });

        replacedPage = frames[replaceIndex];
        frames[replaceIndex] = page;
      }
    }

    steps.push({
      step: index + 1,
      page: page,
      frames: [...frames],
      isHit: isHit,
      isFault: !isHit,
      replacedPage: replacedPage
    });
  });

  return {
    algorithm: 'Optimal',
    pageFrames,
    referenceString,
    steps,
    statistics: {
      totalReferences: referenceString.length,
      pageFaults,
      pageHits: hits,
      hitRatio: (hits / referenceString.length * 100).toFixed(2) + '%',
      faultRatio: (pageFaults / referenceString.length * 100).toFixed(2) + '%'
    }
  };
}

module.exports = router;
