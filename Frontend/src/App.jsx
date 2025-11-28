import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { loginSuccess, logout } from "./store/authSlice";
import { Outlet } from "react-router-dom";
import apiService from "./Api/api";
import { Header } from "./components";
import OSTutorChat from "./components/chatbot/Chatbot.jsx";
import { FiMessageCircle, FiX, FiMinus } from "react-icons/fi";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cachedUser = localStorage.getItem("user");

    // 🔴 No token? redirect
    if (!token) {
      navigate("/login");
      setLoading(false);
      return;
    }

    // ⚡ Instantly set user from cache for fast UI
    if (cachedUser) {
      dispatch(loginSuccess(JSON.parse(cachedUser)));
      setLoading(false);
    }

    // 🔍 Verify token with server in background
    apiService
      .getMe()
      .then((userData) => {
        if (userData) {
          dispatch(loginSuccess(userData));
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          dispatch(logout());
          navigate("/login");
        }
      })
      .catch(() => {
        dispatch(logout());
        navigate("/login");
      });
  }, [navigate, dispatch]);

  // Floating Chat UI
  const FloatingChatbot = () => {
    return (
      <div
        className={`fixed bottom-5 right-5 flex flex-col overflow-hidden transition-all duration-300 
        bg-white rounded-xl shadow-2xl border border-gray-200 z-[1000] 
        ${isMinimized ? "h-[60px]" : "h-[600px]"} w-[400px]`}
      >
        <div
          className={`bg-blue-500 text-white px-4 py-3 flex justify-between items-center 
          ${isMinimized ? "cursor-pointer" : ""}`}
          onClick={() => isMinimized && setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <FiMessageCircle size={18} />
            <span className="font-semibold text-sm">OS Tutor</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="bg-white/20 rounded p-1 flex items-center justify-center"
            >
              <FiMinus size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsChatOpen(false);
                setIsMinimized(false);
              }}
              className="bg-white/20 rounded p-1 flex items-center justify-center"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex-1 overflow-hidden">
            <OSTutorChatFloating onClose={() => setIsChatOpen(false)} />
          </div>
        )}
      </div>
    );
  };

  const OSTutorChatFloating = ({ onClose }) => {
    return (
      <div className="h-full flex flex-col">
        <div className="h-full overflow-hidden flex flex-col">
          <OSTutorChat onClose={onClose} isFloating={true} />
        </div>
      </div>
    );
  };

  if (loading) return null; // 👈 No flash during load

  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 bg-blue-500 text-white rounded-full 
          w-[60px] h-[60px] flex justify-center items-center shadow-lg 
          hover:scale-110 hover:shadow-xl transition-all duration-300 text-2xl z-[999]"
        >
          <FiMessageCircle />
        </button>
      )}

      {/* Chatbot Window */}
      {isChatOpen && <FloatingChatbot />}
    </div>
  );
}

export default App;
