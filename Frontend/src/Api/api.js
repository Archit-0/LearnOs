// api.js - Frontend API Service Client using Axios
import axios from 'axios';

const API_BASE_URL = 'https://learnos-olvx.onrender.com/api';
// const API_BASE_URL = 'http://localhost:5000/api'; 

class ApiService {
  constructor() {
    // Create axios instance
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 1000000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Setup response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        // Handle common error scenarios
        if (error.response?.status === 401) {
          this.clearToken();
          // Optionally redirect to login
          // window.location.href = '/login';
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        console.error('API Error:', errorMessage);
        
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  // Set authentication token
  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Clear authentication token
  clearToken() {
    localStorage.removeItem('authToken');
  }

  // ===============================
  // AUTHENTICATION ENDPOINTS
  // ===============================

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials);
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getMe() {
    return await this.client.get('/auth/me');
  }

  async logout() {
    this.clearToken();
    // If you have a logout endpoint on backend, call it here
    // await this.client.post('/auth/logout');
  }

  // ===============================
  // MODULES & CONTENT ENDPOINTS
  // ===============================

  async getModules() {
    return await this.client.get('/modules');
  }

  async getModule(slug) {
    return await this.client.get(`/modules/${slug}`);
  }

  async updateModuleProgress(moduleId, progressData) {
    return await this.client.put(`/modules/${moduleId}/progress`, progressData);
  }

  // ===============================
  // INTERACTIVE QUIZZES ENDPOINTS
  // ===============================

  async getModuleQuizzes(moduleId) {
    return await this.client.get(`/quizzes/module/${moduleId}`);
  }

  async startQuiz(quizId) {
    return await this.client.post(`/quizzes/${quizId}/start`);
  }

  async submitQuizAnswer(attemptId, answerData) {
    return await this.client.put(`/quizzes/attempt/${attemptId}/answer`, answerData);
  }

  async submitQuizAttempt(attemptId, submissionData = {}) {
    return await this.client.put(`/quizzes/attempt/${attemptId}/submit`, submissionData);
  }

  // ===============================
  // AI CHATBOT ENDPOINTS
  // ===============================

  async sendChatMessage(message, sessionId = null) {
    return await this.client.post('/chatbot/chat', {
      message,
      sessionId,
    });
  }

  async getChatHistory(sessionId) {
    return await this.client.get(`/chatbot/history/${sessionId}`);
  }
  async deleteChatHistory(sessionId) {
    return await this.client.delete(`/chatbot/history/${sessionId}`);
  }

  // ===============================
  // SIMULATORS ENDPOINTS
  // ===============================

  async runCpuSchedulingSimulation(simulationData) {
    return await this.client.post('/simulators/cpu-scheduling', simulationData);
  }

  async runMemoryAllocationSimulation(simulationData) {
    return await this.client.post('/simulators/memory-allocation', simulationData);
  }

  async runPageReplacementSimulation(simulationData) {
    return await this.client.post('/simulators/page-replacement', simulationData);
  }

  // ===============================
  // LEARNING ANALYTICS ENDPOINTS
  // ===============================

  async getProgressDashboard() {
    return await this.client.get('/progress/dashboard');
  }

  async getLearningPathRecommendations() {
    return await this.client.get('/learning-path/recommend');
  }
  async updatePreferences(preference){
    return await this.client.put('/learning-path/preferences',preference);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// ===============================
// USAGE EXAMPLES
// ===============================

/*
// Authentication
try {
  const user = await apiService.register({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  });
  console.log('Registered user:', user);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Login
try {
  const loginResponse = await apiService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Login successful:', loginResponse);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Get modules
try {
  const modules = await apiService.getModules();
  console.log('Available modules:', modules);
} catch (error) {
  console.error('Failed to fetch modules:', error.message);
}

// Start a quiz
try {
  const quizAttempt = await apiService.startQuiz('quiz-123');
  console.log('Quiz started:', quizAttempt);
} catch (error) {
  console.error('Failed to start quiz:', error.message);
}

// Chat with AI
try {
  const chatResponse = await apiService.sendChatMessage(
    'Explain CPU scheduling algorithms',
    'session-456'
  );
  console.log('AI response:', chatResponse);
} catch (error) {
  console.error('Chat failed:', error.message);
}

// Run CPU scheduling simulation
try {
  const result = await apiService.runCpuSchedulingSimulation({
    algorithm: 'FCFS',
    processes: [
      { id: 1, arrivalTime: 0, burstTime: 10 },
      { id: 2, arrivalTime: 1, burstTime: 5 },
      { id: 3, arrivalTime: 3, burstTime: 8 }
    ]
  });
  console.log('Simulation result:', result);
} catch (error) {
  console.error('Simulation failed:', error.message);
}

// Get progress dashboard
try {
  const dashboard = await apiService.getProgressDashboard();
  console.log('Progress data:', dashboard);
} catch (error) {
  console.error('Failed to fetch progress:', error.message);
}
*/

// ===============================
// REACT HOOKS (OPTIONAL)
// ===============================

/*
// Custom hooks for React components
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (localStorage.getItem('authToken')) {
          const userData = await apiService.getMe();
          setUser(userData);
        }
      } catch (error) {
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const response = await apiService.login(credentials);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
};

export const useModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getModules();
      setModules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return { modules, loading, error, refetch: fetchModules };
};

export const useQuiz = () => {
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startQuiz = async (quizId) => {
    setLoading(true);
    setError(null);
    try {
      const attempt = await apiService.startQuiz(quizId);
      setCurrentAttempt(attempt);
      return attempt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (attemptId, answerData) => {
    try {
      const response = await apiService.submitQuizAnswer(attemptId, answerData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const submitAttempt = async (attemptId, submissionData = {}) => {
    setLoading(true);
    try {
      const response = await apiService.submitQuizAttempt(attemptId, submissionData);
      setCurrentAttempt(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentAttempt,
    loading,
    error,
    startQuiz,
    submitAnswer,
    submitAttempt,
    setError
  };
};

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message, sessionId = null) => {
    setLoading(true);
    setError(null);
    
    // Add user message immediately to UI
    const userMessage = { type: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await apiService.sendChatMessage(message, sessionId);
      
      // Add AI response
      const aiMessage = {
        type: 'ai',
        content: response.message || response.response,
        timestamp: new Date(),
        sessionId: response.sessionId
      };
      
      setMessages(prev => [...prev, aiMessage]);
      return response;
    } catch (err) {
      setError(err.message);
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (sessionId) => {
    setLoading(true);
    try {
      const history = await apiService.getChatHistory(sessionId);
      setMessages(history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadHistory,
    clearMessages
  };
};

export const useSimulator = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = async (type, data) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (type) {
        case 'cpu-scheduling':
          result = await apiService.runCpuSchedulingSimulation(data);
          break;
        case 'memory-allocation':
          result = await apiService.runMemoryAllocationSimulation(data);
          break;
        case 'page-replacement':
          result = await apiService.runPageReplacementSimulation(data);
          break;
        default:
          throw new Error(`Unknown simulation type: ${type}`);
      }
      
      setResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    runSimulation,
    clearResults
  };
};
*/

// ===============================
// INSTALLATION INSTRUCTIONS
// ===============================

/*
To use this API service in your React project:

1. Install axios:
   npm install axios

2. Import the service in your components:
   import apiService from './services/api';

3. Use the service methods:
   const modules = await apiService.getModules();

4. For React hooks, uncomment the hooks section above and use them:
   const { user, login, logout } = useAuth();
   const { modules, loading, error } = useModules();
*/