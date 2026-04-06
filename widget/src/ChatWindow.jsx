import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Configure socket with ngrok bypass headers and force WebSockets
const socket = io('https://0ad9-2401-4900-62f1-a3dd-c510-2db9-c1c3-b306.ngrok-free.app', {
  transports: ['websocket'],
  extraHeaders: {
    "ngrok-skip-browser-warning": "true"
  }
});

function ChatWindow({ isOpen, setIsOpen, siteKey }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Listen for AI response
    socket.on('chat:response', (data) => {
      setChat((prev) => [...prev, { text: data.answer, type: 'support' }]);
      setIsLoading(false);
    });

    // Listen for AI errors
    socket.on('chat:error', (err) => {
      console.error("AI Backend Error:", err);
      setChat((prev) => [...prev, { text: "Error: Chat failed", type: 'support' }]);
      setIsLoading(false);
    });

    return () => {
      socket.off('chat:response');
      socket.off('chat:error');
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const sendMsg = () => {
    if (!message.trim() || isLoading) return;

    // 1. Update UI locally
    setChat((prev) => [...prev, { text: message, type: 'user' }]);

    // 2. Emit to the AI Backend with the siteKey we received from props
    socket.emit('chat:message', {
      siteKey: siteKey,
      message: message,
      sessionId: "session-" + siteKey.substring(0, 8) // Basic session tracking
    });

    setIsLoading(true);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMsg();
  };

  return (
    <>
      <style>{`
        .window { position: fixed; bottom: 90px; right: 20px; width: min(360px, calc(100vw - 24px)); height: min(500px, calc(100dvh - 130px)); border-radius: 10px; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; font-family: sans-serif; z-index: 9999; border: 1px solid #eee; transform-origin: bottom right; transition: transform 320ms ease, opacity 320ms ease; will-change: transform, opacity; }
        .window.closed { opacity: 0; transform: translate(-25px, 45px) scale(0.13); pointer-events: none; }
        .window.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
        .header { background: linear-gradient(-90deg, #1f786a, #41b94d, #b3d056); color: white; padding: 0 5px 0 10px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
        .header-title { display: flex; align-items: center; gap: 8px; }
        .header-icon { width: 23px; height: 23px; display: inline-block; }
        .close-btn { background: none; border: none; min-width:10px; padding:9px 8px; color: white; font-size: 18px; cursor: pointer; }
        .messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: #fdfdfd; }
        .bubble { max-width: 80%; padding: 10px; border-radius: 12px; font-size: 14px; }
        .user { align-self: flex-end; background: #007bff; color: white; }
        .support { align-self: flex-start; background: #e9e9eb; color: #333; }
        .loader-bubble { min-width: 52px; display: flex; align-items: center; justify-content: center; }
        .typing-loader { display: inline-flex; align-items: center; gap: 4px; }
        .typing-loader span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9ea0a5;
          animation: typingPulse 1s infinite ease-in-out;
        }
        .typing-loader span:nth-child(2) { animation-delay: 0.15s; }
        .typing-loader span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typingPulse {
          0%, 80%, 100% { opacity: 0.35; transform: scale(0.75); }
          40% { opacity: 1; transform: scale(1); }
        }
        .input-box {
          display: flex;
          align-items: center;
          margin: 10px;
          border: 1px solid #d9dde3;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .input-box:focus-within {
          border-color: #40a650;
          box-shadow: 0 0 0 2px rgba(64, 166, 80, 0.15);
        }
        .send-icon-btn {
          background: transparent;
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 50%;
        }
        .send-icon-btn svg {
          width: 24px;
          height: 24px;
        }
        .send-icon-btn path {
          transition: stroke 0.2s ease, fill 0.2s ease;
        }
        .send-icon-btn:hover path {
          stroke: #28a745;
          fill: #28a745;
        }
        .send-icon-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          pointer-events: none;
        }
        input {
          flex: 1;
          border: none;
          padding: 12px 12px 12px 14px;
          border-radius: 0;
          outline: none;
          font-size: 14px;
          background: transparent;
        }
        input:focus { box-shadow: none; }
        button { color: white; border: none;  cursor: pointer;}
        @media (max-width: 768px) {
          .window {
            right: 12px;
            bottom: 96px;
            width: calc(100vw - 24px);
            height: min(500px, calc(100dvh - 120px));
            border-radius: 12px;
          }
          .window.closed { transform: translate(-14px, 34px) scale(0.16); }
          .header { padding: 0 6px 0 10px; }
          .messages { padding: 12px; }
          .input-box { margin: 8px; }
          .send-icon-btn { width: 40px; height: 40px; }
          input { padding: 11px; }
        }
        @media (max-width: 480px) {
          .window {
            right: 10px;
            bottom: 94px;
            width: calc(100vw - 20px);
            height: calc(100dvh - 112px);
          }
          .window.closed { transform: translate(-10px, 30px) scale(0.18); }
          .header-title { gap: 6px; font-size: 15px; }
          .header-icon { width: 20px; height: 20px; }
          .close-btn { padding: 8px 7px; }
          .bubble { font-size: 13px; }
          .input-box { margin: 7px; }
          .send-icon-btn { width: 38px; height: 38px; }
          input { padding: 10px; }
        }
      `}</style>

      <div className={`window ${isOpen ? 'open' : 'closed'}`}>
        <div className="header">
          <div className="header-title">
            <svg className="header-icon" xmlns="http://www.w3.org/2000/svg" width="25.977" height="20.487" viewBox="0 0 25.977 20.487" aria-hidden="true">
              <g transform="translate(.2 -.3)">
                <path d="M62.614 47.848l-.028-.026-.032-.031-.025-.022-.037-.032-.023-.018-.041-.032-.025-.018-.041-.029-.021-.013-.048-.031-.011-.006-.059-.033h-.008l-.064-.032h-.008l-.066-.029h-.005c-.048-.02-.1-.037-.146-.052h-.016l-.062-.017-.078-.027h-.02l-.061-.01h-.031l-.05-.006h-.164a1.658 1.658 0 0 0-1.655 1.655v1.069a.372.372 0 0 0 .372.372h2.567a.372.372 0 0 0 .372-.372v-1.089a1.642 1.642 0 0 0-.485-1.17zm-.259 1.868h-1.823v-.7a.911.911 0 0 1 1.823 0zm0 0" fill="#fff" stroke="#fff" strokeWidth=".4" transform="translate(-56.082 -43.958)" />
                <path d="M249.155 47.359a1.657 1.657 0 0 0-1.655 1.655v1.069a.372.372 0 0 0 .372.372h2.566a.372.372 0 0 0 .372-.372v-1.068a1.656 1.656 0 0 0-1.655-1.655zm.911 2.353h-1.823v-.7a.911.911 0 1 1 1.823 0zm0 0" fill="#fff" stroke="#fff" strokeWidth=".4" transform="translate(-232.156 -43.954)" />
                <path d="M138.439 118.359h-5.134a.372.372 0 0 0-.372.372 2.939 2.939 0 0 0 5.878 0 .372.372 0 0 0-.372-.372zm-1.015 1.924a2.195 2.195 0 0 1-3.715-1.18h4.327a2.18 2.18 0 0 1-.612 1.18zm0 0" fill="#fff" stroke="#fff" strokeWidth=".4" transform="translate(-124.692 -110.553)" />
                <path d="M19.665 17.81h-3.112a2.4 2.4 0 1 0 0 .744h3.112a4.521 4.521 0 0 0 4.516-4.516v-3.6A3.578 3.578 0 0 0 22.36 4.07V2.8a2.3 2.3 0 0 0-2.3-2.3H2.3A2.3 2.3 0 0 0 0 2.8v9.66a2.3 2.3 0 0 0 2.3 2.3h.78v4.2a.372.372 0 0 0 .619.278l5.028-4.476h11.336a2.3 2.3 0 0 0 2.3-2.3v-1.277a3.554 3.554 0 0 0 1.077-.3v3.15a3.776 3.776 0 0 1-3.775 3.775zm-5.482 2.026a1.655 1.655 0 1 1 1.655-1.655 1.654 1.654 0 0 1-1.655 1.656zm7.433-7.379a1.555 1.555 0 0 1-1.553 1.553H8.586a.372.372 0 0 0-.247.094l-4.515 4.019v-3.74a.372.372 0 0 0-.372-.372H2.3a1.555 1.555 0 0 1-1.556-1.554V2.8A1.555 1.555 0 0 1 2.3 1.244h17.763A1.555 1.555 0 0 1 21.617 2.8zm.744-7.638a2.836 2.836 0 0 1 0 5.616zm0 0" fill="#fff" stroke="#fff" strokeWidth=".4" />
              </g>
            </svg>
            <span>Smiles Chat</span>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>
        <div className="messages">
          {chat.map((msg, i) => (
            <div key={i} className={`bubble ${msg.type}`}>{msg.text}</div>
          ))}
          {isLoading && (
            <div className="bubble support loader-bubble" aria-live="polite" aria-label="Assistant is typing">
              <span className="typing-loader" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="input-box">
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask us anything..."
          />
          <button className="send-icon-btn" onClick={sendMsg} disabled={isLoading} aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <g>
                <g>
                  <path fill="none" stroke="#7d8d9f" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M0 0l17 9-17 9 6-9z" transform="translate(4 3)" />
                </g>
              </g>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatWindow;