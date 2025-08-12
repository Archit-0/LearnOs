import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, BookOpen, Trash2, Loader, AlertCircle, Settings, HelpCircle, Cpu, Lock, Clock, HardDrive, Zap, Info, X } from 'lucide-react';
import apiService from '../../Api/api';

const OSTutorChat = ({ onClose, isFloating = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const [context, setContext] = useState({
    currentModule: '',
    topics: [],
    userLevel: 'intermediate'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setSessionId(generateSessionId());
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your OS tutor. I'm here to help you learn Operating Systems concepts like process scheduling, memory management, deadlocks, synchronization, and more. What would you like to explore today?",
      timestamp: new Date()
    }]);
  }, []);

  const generateSessionId = () => {
    return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const data = await apiService.sendChatMessage(inputMessage, sessionId);

      const assistantMessage = {
        role: 'assistant',
        content: data.message || data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Here are some OS topics I can help with: Process Scheduling, Memory Management, Deadlocks, Synchronization, File Systems. What interests you?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      await apiService.deleteChatHistory(sessionId);
      setMessages([{
        role: 'assistant',
        content: "Chat history cleared! What OS topic would you like to learn about?",
        timestamp: new Date()
      }]);
      setSessionId(generateSessionId());
      setError('');
    } catch (err) {
      console.error('Error clearing history:', err);
      setError(err.message);
    }
  };

  const quickTopics = [
    'Process Scheduling',
    'Deadlock Prevention',
    'Memory Paging',
    'Semaphores',
    'CPU Scheduling',
    'Virtual Memory'
  ];

  const osConceptsInfo = {
    'CPU Scheduling': {
      icon: Cpu,
      title: 'CPU Scheduling',
      description: 'CPU scheduling determines which process runs next on the processor.',
      details: 'Common algorithms include FCFS (First Come First Served), SJF (Shortest Job First), Round Robin, and Priority Scheduling. Each has different performance characteristics.',
      examples: ['FCFS: Simple queue-based scheduling', 'Round Robin: Time-sliced execution', 'SJF: Shortest job runs first']
    },
    'Memory Management': {
      icon: Clock,
      title: 'Memory Management',
      description: 'How the OS manages system memory allocation and deallocation.',
      details: 'Includes virtual memory, paging, segmentation, and memory protection mechanisms.',
      examples: ['Paging: Fixed-size memory blocks', 'Virtual Memory: More memory than physical RAM', 'Memory Protection: Process isolation']
    },
    'Process Synchronization': {
      icon: Lock,
      title: 'Process Synchronization',
      description: 'Coordination between processes to ensure data consistency.',
      details: 'Uses semaphores, mutexes, monitors, and other synchronization primitives.',
      examples: ['Semaphores: Counting access control', 'Mutexes: Mutual exclusion locks', 'Critical Sections: Protected code regions']
    },
    'Deadlock': {
      icon: AlertCircle,
      title: 'Deadlock Prevention',
      description: 'Preventing processes from being blocked forever waiting for resources.',
      details: 'Four conditions must exist: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
      examples: ['Resource ordering', 'Timeouts for resource requests', 'Deadlock detection algorithms']
    },
    'File Systems': {
      icon: HardDrive,
      title: 'File Systems',
      description: 'How data is stored and organized on storage devices.',
      details: 'Includes file allocation methods, directory structures, and disk scheduling.',
      examples: ['FAT32, NTFS file systems', 'Directory hierarchies', 'Disk scheduling algorithms']
    },
    'I/O Management': {
      icon: Zap,
      title: 'I/O Management',
      description: 'Managing input/output operations between processes and devices.',
      details: 'Includes device drivers, buffering, and interrupt handling.',
      examples: ['Device drivers', 'Interrupt handling', 'DMA (Direct Memory Access)']
    }
  };

  const handleQuickTopic = (topic) => {
    setInputMessage(`Tell me about ${topic}`);
    inputRef.current?.focus();
  };

  const Tooltip = ({ content, children, show }) => (
    <div className="relative inline-block">
      {children}
      {show && (
        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
        </div>
      )}
    </div>
  );

  const InfoModal = ({ concept, onClose }) => {
    if (!concept) return null;

    const info = osConceptsInfo[concept];
    const IconComponent = info.icon;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-sm w-full p-4 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 mb-3">
            <div className="bg-blue-100 p-1 rounded">
              <IconComponent className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{info.title}</h3>
          </div>

          <p className="text-gray-600 mb-3 text-sm">{info.description}</p>
          <p className="text-xs text-gray-700 mb-3">{info.details}</p>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 text-sm">Examples:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {info.examples.map((example, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-1">•</span>
                  {example}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                setInputMessage(`Explain ${info.title.toLowerCase()} in detail`);
                onClose();
                inputRef.current?.focus();
              }}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Ask about {info.title}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Different layouts for floating vs full screen
  const containerClass = isFloating 
    ? "flex flex-col h-full bg-white" 
    : "flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100";

  return (
    <div className={containerClass}>
      {/* Header - Hidden in floating mode since we have custom header */}
      {!isFloating && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">OS Tutor</h1>
                  <p className="text-sm text-gray-600">Your Operating Systems Learning Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={clearHistory}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Floating mode controls */}
      {isFloating && (
        <div className="flex justify-end p-2 border-b border-gray-200 bg-gray-50">
          <button
            onClick={clearHistory}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded text-xs"
            title="Clear Chat"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Settings Panel - Simplified for floating mode */}
      {showSettings && !isFloating && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Level</label>
                <select
                  value={context.userLevel}
                  onChange={(e) => setContext({ ...context, userLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Module</label>
                <input
                  type="text"
                  value={context.currentModule}
                  onChange={(e) => setContext({ ...context, currentModule: e.target.value })}
                  placeholder="e.g., Process Management"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus Topics</label>
                <input
                  type="text"
                  placeholder="e.g., Scheduling, Deadlocks"
                  onChange={(e) => setContext({ ...context, topics: e.target.value.split(',').map(t => t.trim()) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mx-2 mt-2 rounded text-xs">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-400 mr-2" />
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Quick Topics - Compact for floating */}
      <div className={`${isFloating ? 'px-2 py-2' : 'max-w-4xl mx-auto px-4 py-4'}`}>
        <div className="flex flex-wrap gap-1">
          {quickTopics.slice(0, isFloating ? 4 : 6).map((topic, index) => (
            <button
              key={index}
              onClick={() => handleQuickTopic(topic)}
              className={`px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors ${
                isFloating ? 'text-xs' : 'text-sm'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* OS Concepts Icons - Simplified for floating */}
      {!isFloating && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              OS Concepts - Hover for info, Click for details
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(osConceptsInfo).map(([concept, info]) => {
                const IconComponent = info.icon;
                return (
                  <Tooltip key={concept} content={info.description} show={showTooltip === concept}>
                    <button
                      onClick={() => setShowInfoModal(concept)}
                      onMouseEnter={() => setShowTooltip(concept)}
                      onMouseLeave={() => setShowTooltip(null)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 hover:shadow-md group"
                    >
                      <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
                        {info.title}
                      </span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className={`flex-1 overflow-y-auto ${isFloating ? 'px-2' : 'max-w-4xl mx-auto w-full px-4'}`}>
        <div className={`space-y-${isFloating ? '2' : '4'} pb-2`}>
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex ${isFloating ? 'max-w-xs' : 'max-w-3xl'} ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                <div className={`flex-shrink-0 ${isFloating ? 'w-6 h-6' : 'w-8 h-8'} rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-600 ml-2' : 'bg-gray-600 mr-2'
                }`}>
                  {message.role === 'user' ? (
                    <User className={`${isFloating ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                  ) : (
                    <Bot className={`${isFloating ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                  )}
                </div>
                <div className={`${isFloating ? 'p-2' : 'p-4'} rounded-lg shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  <div className={`whitespace-pre-wrap ${isFloating ? 'text-xs' : 'text-sm'}`}>
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp?.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className={`flex-shrink-0 ${isFloating ? 'w-6 h-6' : 'w-8 h-8'} bg-gray-600 rounded-full flex items-center justify-center mr-2`}>
                  <Bot className={`${isFloating ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                </div>
                <div className={`bg-white ${isFloating ? 'p-2' : 'p-4'} rounded-lg shadow-sm border border-gray-200`}>
                  <div className="flex items-center space-x-2">
                    <Loader className={`${isFloating ? 'w-3 h-3' : 'w-4 h-4'} animate-spin text-blue-600`} />
                    <span className={`text-gray-600 ${isFloating ? 'text-xs' : 'text-sm'}`}>Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-2">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about OS concepts..."
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isFloating ? 'text-xs' : 'text-sm'
              }`}
              rows={isFloating ? "1" : "2"}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`${isFloating ? 'px-3 py-2' : 'px-6 py-3'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            <Send className={`${isFloating ? 'w-3 h-3' : 'w-5 h-5'}`} />
          </button>
        </div>
        {!isFloating && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send • Shift+Enter for new line
          </div>
        )}
      </div>

      {/* Info Modal */}
      <InfoModal concept={showInfoModal} onClose={() => setShowInfoModal(null)} />
    </div>
  );
};

export default OSTutorChat;