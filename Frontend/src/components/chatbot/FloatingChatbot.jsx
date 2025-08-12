import { FiMessageCircle, FiX, FiMinus } from 'react-icons/fi'
import OSTutorChat from './Chatbot.jsx'
import { useState } from 'react';
export const FloatingChatbot = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        height: isMinimized ? '60px' : '600px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.3s ease-in-out',
        border: '1px solid #e2e8f0'
      }}
    >
      {/* Floating Chat Header */}
      <div className='bg-black text-white'
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: isMinimized ? 'pointer' : 'default'
        }}
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
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiMinus size={14} color="white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsChatOpen(false);
              setIsMinimized(false);
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
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