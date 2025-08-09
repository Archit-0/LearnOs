import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Index from './simulation/OperatingSystem/Index.jsx'
import Modules from './pages/Module.jsx'
// import QuizStart from './pages/QuizStart.jsx'
import QuizAttempt from './pages/QuizAttempts.jsx'
import CPUScheduling from "./simulation/CPUSchedulingSimulator.jsx"
import MemorySimulation from './simulation/MemorySimulation.jsx'
import VirtualMemory from './simulation/VirtualMemory.jsx'
import OSSimulation from './simulation/OS_Process_Deadlock.jsx'
import LearningDashboard from './pages/LearningDashboard.jsx'
const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: '/Dashboard',
        element: <Dashboard />
      },
      {
        path: "/quizzes",
        element: <Modules />
      },
      {
        path: "quizzes/start/:Id",
        element: <QuizAttempt />
      },
      {
        path: "/simulation/",
        children: [
          {
            path: "Introduction-to-os",
            element: <Index />
          },
          {
            path: "Cpu-scheduling",
            element: <CPUScheduling />
          }, {
            path: "Process-Scheduling",
            element: <VirtualMemory />
          },
          {
            path: "Memory-Management",
            element: <MemorySimulation />
          },
          {
            path: "more-topic",
            element: <OSSimulation />
          }
        ]
      },
      {
        path: '/learning-path',
        element: <LearningDashboard />
      }
    ]
  },

])

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Provider store={store}>
      <RouterProvider router={route} />
    </Provider>


  </StrictMode >,
)
