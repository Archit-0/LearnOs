import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import { useNavigate } from 'react-router-dom'
import { loginSuccess, logout } from './store/authSlice.js'
import { Outlet } from 'react-router-dom'
import apiService from './Api/api.js'
import { Header } from './components'
import OSTutorChat from './components/chatbot/Chatbot.jsx'
import { FiMessageCircle, FiX, FiMinus } from 'react-icons/fi'

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setloading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getMe()
        .then((userData) => {
          if (userData) {
            dispatch(loginSuccess(userData));
          } else {
            dispatch(logout());
            navigate('/login');
          }
        })
        .catch(() => {
          dispatch(logout());
          navigate('/login');
        })
        .finally(() => setloading(false));
    } else {
      navigate('/login');
      setloading(false);
    }
  }, [navigate, dispatch]);

  const FloatingChatbot = () => {
    return (
      <div className={`fixed bottom-5 right-5 flex flex-col overflow-hidden transition-all duration-300 bg-white rounded-xl shadow-2xl border border-gray-200 z-[1000] ${isMinimized ? "h-[60px]" : "h-[600px]"
        } w-[400px]`}
      >
        {/* Floating Chat Header */}
        <div className={`bg-blue-500 text-white px-4 py-3 flex justify-between items-center ${isMinimized ? "cursor-pointer" : ""
          }`}
          onClick={() => isMinimized && setIsMinimized(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMessageCircle size={18} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>OS Tutor</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="bg-white/20 rounded p-1 flex items-center justify-center"
            >
              <FiMinus size={14} color="white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsChatOpen(false);
                setIsMinimized(false);
              }}
              className="bg-white/20 rounded p-1 flex items-center justify-center"
            >
              <FiX size={14} color="white" />
            </button>
          </div>
        </div>

        Chat Content
        {!isMinimized && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <OSTutorChatFloating onClose={() => setIsChatOpen(false)} />
          </div>
        )}
      </div>
    );
  };

  // // Modified OSTutorChat component for floating window
  const OSTutorChatFloating = ({ onClose }) => {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Use your existing OSTutorChat component but with modified styling */}
        <div style={{
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <OSTutorChat
            onClose={onClose}
            isFloating={true} // Pass this prop to modify the component's behavior
          />
        </div>
      </div>
    );
  };

  return (
    !loading && (
      <div>
        <Header />
        <main>
          <Outlet />
        </main>

        {/* Floating Chat Button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-5 right-5 bg-blue-500 text-white rounded-full w-[60px] h-[60px] flex justify-center items-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 text-2xl z-[999]"
          >
            <FiMessageCircle />
          </button>
        )}

        {/* Floating Chatbot Window */}
        {isChatOpen && <FloatingChatbot />}
      </div>
    )
  );
}

export default App;