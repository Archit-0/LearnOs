// api.js - Frontend API Service Client using Axios
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // ✔ Correct timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // ====== REQUEST INTERCEPTOR ======
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token"); // ✔ unified key

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // ====== RESPONSE INTERCEPTOR ======
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
        }

        const msg =
          error.response?.data?.message ||
          error.message ||
          "Something went wrong";

        console.error("API Error:", msg);

        return Promise.reject(new Error(msg));
      }
    );
  }

  // ===== Token Helpers =====
  setToken(token) {
    localStorage.setItem("token", token); // ✔ unified
  }

  clearToken() {
    localStorage.removeItem("token"); // ✔ unified
  }

  // ===============================
  // AUTH
  // ===============================

  async register(data) {
    const res = await this.client.post("/auth/register", data);

    if (res.token) this.setToken(res.token);

    return res;
  }

  async login(credentials) {
    const res = await this.client.post("/auth/login", credentials);

    if (res.token) this.setToken(res.token);

    return res;
  }

  async getMe() {
    return this.client.get("/auth/me");
  }

  async logout() {
    this.clearToken();
  }

  // ===============================
  // MODULES
  // ===============================

  getModules() {
    return this.client.get("/modules");
  }

  getModule(slug) {
    return this.client.get(`/modules/${slug}`);
  }

  updateModuleProgress(id, progress) {
    return this.client.put(`/modules/${id}/progress`, progress);
  }

  // ===============================
  // QUIZZES
  // ===============================

  getModuleQuizzes(moduleId) {
    return this.client.get(`/quizzes/module/${moduleId}`);
  }

  startQuiz(quizId) {
    return this.client.post(`/quizzes/${quizId}/start`);
  }

  submitQuizAnswer(attemptId, data) {
    return this.client.put(`/quizzes/attempt/${attemptId}/answer`, data);
  }

  submitQuizAttempt(attemptId, data = {}) {
    return this.client.put(`/quizzes/attempt/${attemptId}/submit`, data);
  }

  // ===============================
  // CHATBOT
  // ===============================

  sendChatMessage(message, sessionId = null) {
    return this.client.post("/chatbot/chat", { message, sessionId });
  }

  getChatHistory(sessionId) {
    return this.client.get(`/chatbot/history/${sessionId}`);
  }

  deleteChatHistory(sessionId) {
    return this.client.delete(`/chatbot/history/${sessionId}`);
  }

  // ===============================
  // SIMULATORS
  // ===============================

  runCpuSchedulingSimulation(data) {
    return this.client.post("/simulators/cpu-scheduling", data);
  }

  runMemoryAllocationSimulation(data) {
    return this.client.post("/simulators/memory-allocation", data);
  }

  runPageReplacementSimulation(data) {
    return this.client.post("/simulators/page-replacement", data);
  }

  // ===============================
  // LEARNING ANALYTICS
  // ===============================

  getProgressDashboard() {
    return this.client.get("/progress/dashboard");
  }

  getLearningPathRecommendations() {
    return this.client.get("/learning-path/recommend");
  }

  updatePreferences(data) {
    return this.client.put("/learning-path/preferences", data);
  }
}

// Export Singleton
const apiService = new ApiService();
export default apiService;
