import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Info } from 'lucide-react';

const VirtualMemorySimulation = () => {
  const [algorithm, setAlgorithm] = useState('FIFO');
  const [frameCount, setFrameCount] = useState(3);
  const [pageSequence, setPageSequence] = useState('1,2,3,4,1,2,5,1,2,3,4,5');
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [results, setResults] = useState(null);

  // Parse page sequence
  const pages = pageSequence.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));

  // FIFO Algorithm
  const simulateFIFO = (pages, frameCount) => {
    const frames = [];
    const steps = [];
    let pageFaults = 0;
    let fifoQueue = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const framesCopy = [...frames];
      let hit = false;

      if (framesCopy.includes(page)) {
        hit = true;
      } else {
        pageFaults++;
        if (framesCopy.length < frameCount) {
          framesCopy.push(page);
          fifoQueue.push(page);
        } else {
          const oldestPage = fifoQueue.shift();
          const oldestIndex = framesCopy.indexOf(oldestPage);
          framesCopy[oldestIndex] = page;
          fifoQueue.push(page);
        }
      }

      frames.length = 0;
      frames.push(...framesCopy);

      steps.push({
        step: i,
        page,
        frames: [...framesCopy],
        hit,
        pageFaults: pageFaults
      });
    }

    return { steps, totalPageFaults: pageFaults, hitRate: ((pages.length - pageFaults) / pages.length * 100).toFixed(1) };
  };

  // LRU Algorithm
  const simulateLRU = (pages, frameCount) => {
    const frames = [];
    const steps = [];
    let pageFaults = 0;
    let usage = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const framesCopy = [...frames];
      let hit = false;

      const existingIndex = framesCopy.indexOf(page);
      if (existingIndex !== -1) {
        hit = true;
        // Update usage order
        usage = usage.filter(p => p !== page);
        usage.push(page);
      } else {
        pageFaults++;
        if (framesCopy.length < frameCount) {
          framesCopy.push(page);
          usage.push(page);
        } else {
          // Find least recently used
          const lruPage = usage[0];
          const lruIndex = framesCopy.indexOf(lruPage);
          framesCopy[lruIndex] = page;
          usage = usage.filter(p => p !== lruPage);
          usage.push(page);
        }
      }

      frames.length = 0;
      frames.push(...framesCopy);

      steps.push({
        step: i,
        page,
        frames: [...framesCopy],
        hit,
        pageFaults: pageFaults
      });
    }

    return { steps, totalPageFaults: pageFaults, hitRate: ((pages.length - pageFaults) / pages.length * 100).toFixed(1) };
  };

  // Optimal Algorithm
  const simulateOptimal = (pages, frameCount) => {
    const frames = [];
    const steps = [];
    let pageFaults = 0;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const framesCopy = [...frames];
      let hit = false;

      if (framesCopy.includes(page)) {
        hit = true;
      } else {
        pageFaults++;
        if (framesCopy.length < frameCount) {
          framesCopy.push(page);
        } else {
          // Find the page that will be used farthest in the future
          let farthestIndex = -1;
          let pageToReplace = -1;

          for (const framePage of framesCopy) {
            let nextUse = pages.length;
            for (let j = i + 1; j < pages.length; j++) {
              if (pages[j] === framePage) {
                nextUse = j;
                break;
              }
            }
            if (nextUse > farthestIndex) {
              farthestIndex = nextUse;
              pageToReplace = framePage;
            }
          }

          const replaceIndex = framesCopy.indexOf(pageToReplace);
          framesCopy[replaceIndex] = page;
        }
      }

      frames.length = 0;
      frames.push(...framesCopy);

      steps.push({
        step: i,
        page,
        frames: [...framesCopy],
        hit,
        pageFaults: pageFaults
      });
    }

    return { steps, totalPageFaults: pageFaults, hitRate: ((pages.length - pageFaults) / pages.length * 100).toFixed(1) };
  };

  // Run simulation
  const runSimulation = () => {
    let result;
    switch (algorithm) {
      case 'FIFO':
        result = simulateFIFO(pages, frameCount);
        break;
      case 'LRU':
        result = simulateLRU(pages, frameCount);
        break;
      case 'Optimal':
        result = simulateOptimal(pages, frameCount);
        break;
      default:
        result = simulateFIFO(pages, frameCount);
    }
    setResults(result);
    setCurrentStep(0);
  };

  // Auto-step through simulation
  useEffect(() => {
    if (isRunning && results && currentStep < results.steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (isRunning && results && currentStep >= results.steps.length - 1) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, results, speed]);

  // Initialize simulation on parameter change
  useEffect(() => {
    runSimulation();
  }, [algorithm, frameCount, pageSequence]);

  const reset = () => {
    setCurrentStep(0);
    setIsRunning(false);
  };

  if (!results || pages.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <div className="text-center">
          <Info className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Configure Simulation</h3>
          <p className="text-gray-600">Please enter a valid page sequence to start the simulation.</p>
        </div>
      </div>
    );
  }

  const currentStepData = results.steps[currentStep] || results.steps[0];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Virtual Memory Simulation</h1>
        <p className="text-gray-600">Interactive Page Replacement Algorithm Demonstration</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="FIFO">FIFO (First In First Out)</option>
              <option value="LRU">LRU (Least Recently Used)</option>
              <option value="Optimal">Optimal (Farthest Future Use)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frame Count</label>
            <input
              type="number"
              min="1"
              max="10"
              value={frameCount}
              onChange={(e) => setFrameCount(parseInt(e.target.value) || 3)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speed (ms)</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Page Reference String</label>
          <input
            type="text"
            value={pageSequence}
            onChange={(e) => setPageSequence(e.target.value)}
            placeholder="e.g., 1,2,3,4,1,2,5,1,2,3,4,5"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Current State Display */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Current State</h2>
          <div className="text-sm text-gray-600">
            Step {currentStepData.step + 1} of {pages.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Current Page</h3>
            <div className="w-16 h-16 mx-auto bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
              {currentStepData.page}
            </div>
            <div className={`mt-2 px-2 py-1 rounded text-sm font-medium ${currentStepData.hit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              {currentStepData.hit ? 'HIT' : 'MISS'}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Memory Frames</h3>
            <div className="flex justify-center gap-2">
              {Array.from({ length: frameCount }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold border-2 ${i < currentStepData.frames.length
                      ? 'bg-indigo-500 text-white border-indigo-600'
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                    }`}
                >
                  {i < currentStepData.frames.length ? currentStepData.frames[i] : '—'}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Page Faults</h3>
            <div className="text-3xl font-bold text-red-600">
              {currentStepData.pageFaults}
            </div>
            <div className="text-sm text-gray-500">
              out of {currentStepData.step + 1} references
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentStep + 1) / pages.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / pages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Controls */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <span className="text-gray-600">
            Step {currentStep + 1} / {pages.length}
          </span>

          <button
            onClick={() => setCurrentStep(Math.min(results.steps.length - 1, currentStep + 1))}
            disabled={currentStep >= results.steps.length - 1}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Page Faults</h3>
            <div className="text-3xl font-bold text-red-600">{results.totalPageFaults}</div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Hit Rate</h3>
            <div className="text-3xl font-bold text-green-600">{results.hitRate}%</div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total References</h3>
            <div className="text-3xl font-bold text-blue-600">{pages.length}</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Algorithm Description</h3>
          <div className="text-gray-600 text-sm">
            {algorithm === 'FIFO' && "First In First Out: Replaces the oldest page in memory."}
            {algorithm === 'LRU' && "Least Recently Used: Replaces the page that hasn't been accessed for the longest time."}
            {algorithm === 'Optimal' && "Optimal: Replaces the page that will be accessed farthest in the future (theoretical best)."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualMemorySimulation;