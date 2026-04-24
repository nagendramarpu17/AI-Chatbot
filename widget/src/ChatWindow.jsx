import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Configure socket with ngrok bypass headers and force WebSockets
const socket = io('https://09d7-116-73-141-55.ngrok-free.app', {
  transports: ['websocket'],
  extraHeaders: {
    "ngrok-skip-browser-warning": "true"
  }
});

const AgentBubbleIcon = () => (
  <svg viewBox="0 0 25.977 20.487" width="20" height="16" fill="currentColor" stroke="currentColor" aria-hidden="true">
    <g transform="translate(.2 -.3)">
      <path d="M62.614 47.848l-.028-.026-.032-.031-.025-.022-.037-.032-.023-.018-.041-.032-.025-.018-.041-.029-.021-.013-.048-.031-.011-.006-.059-.033h-.008l-.064-.032h-.008l-.066-.029h-.005c-.048-.02-.1-.037-.146-.052h-.016l-.062-.017-.078-.027h-.02l-.061-.01h-.031l-.05-.006h-.164a1.658 1.658 0 0 0-1.655 1.655v1.069a.372.372 0 0 0 .372.372h2.567a.372.372 0 0 0 .372-.372v-1.089a1.642 1.642 0 0 0-.485-1.17zm-.259 1.868h-1.823v-.7a.911.911 0 0 1 1.823 0zm0 0" strokeWidth=".4" transform="translate(-56.082 -43.958)" />
      <path d="M249.155 47.359a1.657 1.657 0 0 0-1.655 1.655v1.069a.372.372 0 0 0 .372.372h2.566a.372.372 0 0 0 .372-.372v-1.068a1.656 1.656 0 0 0-1.655-1.655zm.911 2.353h-1.823v-.7a.911.911 0 1 1 1.823 0zm0 0" strokeWidth="1" transform="translate(-232.156 -43.954)" />
      <path d="M138.439 118.359h-5.134a.372.372 0 0 0-.372.372 2.939 2.939 0 0 0 5.878 0 .372.372 0 0 0-.372-.372zm-1.015 1.924a2.195 2.195 0 0 1-3.715-1.18h4.327a2.18 2.18 0 0 1-.612 1.18zm0 0" strokeWidth="1" transform="translate(-124.692 -110.553)" />
      <path d="M19.665 17.81h-3.112a2.4 2.4 0 1 0 0 .744h3.112a4.521 4.521 0 0 0 4.516-4.516v-3.6A3.578 3.578 0 0 0 22.36 4.07V2.8a2.3 2.3 0 0 0-2.3-2.3H2.3A2.3 2.3 0 0 0 0 2.8v9.66a2.3 2.3 0 0 0 2.3 2.3h.78v4.2a.372.372 0 0 0 .619.278l5.028-4.476h11.336a2.3 2.3 0 0 0 2.3-2.3v-1.277a3.554 3.554 0 0 0 1.077-.3v3.15a3.776 3.776 0 0 1-3.775 3.775zm-5.482 2.026a1.655 1.655 0 1 1 1.655-1.655 1.654 1.654 0 0 1-1.655 1.656zm7.433-7.379a1.555 1.555 0 0 1-1.553 1.553H8.586a.372.372 0 0 0-.247.094l-4.515 4.019v-3.74a.372.372 0 0 0-.372-.372H2.3a1.555 1.555 0 0 1-1.556-1.554V2.8A1.555 1.555 0 0 1 2.3 1.244h17.763A1.555 1.555 0 0 1 21.617 2.8zm.744-7.638a2.836 2.836 0 0 1 0 5.616zm0 0" strokeWidth="1" />
    </g>
  </svg>
);

const UserBubbleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" style={{ position: 'relative', top: '-1px' }}>
    <circle cx="12" cy="9" r="4" />
    <path d="M12 15c-4 0-6 2-6 4v3h12v-3c0-2-2-4-6-4z" />
  </svg>
);

const urlRegex = /(https?:\/\/[^\s'"()<>]+)/gi;

const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/[.,)\]!?]+$/, '');
};

const extractUrls = (text) => {
  if (!text) return [];
  return Array.from(new Set((text.match(urlRegex) || []).map(normalizeUrl)));
};

const renderTextWithLinks = (text) => {
  if (typeof text !== 'string' || !text) return text;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }
    const rawUrl = match[0];
    const url = normalizeUrl(rawUrl);
    elements.push(
      <a key={`${url}-${match.index}`} href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    );
    lastIndex = match.index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length ? elements : text;
};

const isHtmlContent = (text) => {
  if (typeof text !== 'string') return false;
  return /<[^>]*>/g.test(text);
};

const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return '';

  try {
    const allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'div', 'span'];
    const allowedAttributes = { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'style'] };

    if (typeof DOMParser === 'undefined') {
      return html; // Fallback for environments without DOMParser
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc || !doc.body) {
      return html;
    }

    const walkNode = (node) => {
      if (node.nodeType === 3) return; 
      if (node.nodeType !== 1) return;

      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        while (node.firstChild) {
          node.parentNode.insertBefore(node.firstChild, node);
        }
        node.parentNode.removeChild(node);
        return;
      }

      const attrs = Array.from(node.attributes || []);
      attrs.forEach((attr) => {
        const allowedAttrs = allowedAttributes[node.tagName.toLowerCase()] || [];
        if (!allowedAttrs.includes(attr.name)) {
          node.removeAttribute(attr.name);
        }
      });

      if (node.tagName.toLowerCase() === 'a') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }

      Array.from(node.childNodes).forEach(walkNode);
    };

    walkNode(doc.body);
    return doc.body.innerHTML || html;
  } catch (error) {
    console.error('HTML sanitization error:', error);
    return html;
  }
};

function ChatWindow({ isOpen, setIsOpen, siteKey }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleResponse = (data) => {
      const payload = typeof data === 'string' ? { answer: data } : data || {};
      const answerText = payload.answer || payload.text || payload.message || payload.response || '';
      const urlsFromPayload = payload.urls || payload.links || (payload.url ? [payload.url] : []);
      const urls = Array.isArray(urlsFromPayload) && urlsFromPayload.length
        ? urlsFromPayload
        : extractUrls(answerText);

      setChat((prev) => [...prev, { text: answerText, urls, type: 'support' }]);
      setIsLoading(false);
    };

    socket.on('chat:response', handleResponse);

    socket.on('chat:error', (err) => {
      console.error('AI Backend Error:', err);
      setChat((prev) => [...prev, { text: 'Error: Chat failed', type: 'support' }]);
      setIsLoading(false);
    });

    return () => {
      socket.off('chat:response', handleResponse);
      socket.off('chat:error');
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const startNewChat = () => {
    setChat([]);
    setMessage('');
    setIsLoading(false);
  };

  const sendMsg = () => {
    if (!message.trim() || isLoading) return;

    setChat((prev) => [...prev, { text: message, type: 'user' }]);
    socket.emit('chat:message', { message, siteKey });
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
        .header { background: linear-gradient(-90deg, #1f786a, #41b94d, #b3d056); color: white; padding: 10px 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .header-title { display: flex; flex-direction: row; align-items: center; gap: 12px; flex: 1; }
        .header-main { display: flex; flex-direction: column; align-items: flex-start; gap: 0px; justify-content: center; }
        .header-subtitle { font-size: 13px; font-weight: normal; opacity: 0.85; margin: 0; letter-spacing: 0.3px; }
        .header-icon { width: 25px; height: 25px; flex-shrink: 0; display: inline-block; }
        
        .header-actions { display: flex; align-items: center; gap: 1px; flex-shrink: 0; }
        .icon-action-btn, .close-btn { background: none; border: none; padding: 2px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: background 0.2s ease; position: relative; }
        .icon-action-btn:hover, .close-btn:hover { background: rgba(255, 255, 255, 0.2); }
        .close-btn { font-size: 18px; padding: 0.29rem 0.4rem; line-height: 1; }
        
        /* Tooltip Styles */
        .icon-action-btn[data-tooltip]::after {
          content: attr(data-tooltip);
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          background: white;
          color: #4a4a4a;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1);
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease-in-out;
          pointer-events: none;
          z-index: 1000;
        }
        .icon-action-btn[data-tooltip]::before {
          content: '';
          position: absolute;
          top: calc(100% + 2px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          border-width: 6px;
          border-style: solid;
          border-color: transparent transparent white transparent;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease-in-out;
          pointer-events: none;
          z-index: 1000;
        }
        .icon-action-btn[data-tooltip]:hover::after,
        .icon-action-btn[data-tooltip]:hover::before {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
        
        .messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #fdfdfd; }
        .bubble { display: flex; gap: 10px; align-items: flex-end; max-width: 85%; }
        .bubble.user { align-self: flex-end; flex-direction: row-reverse; }
        .bubble.support { align-self: flex-start; flex-direction: row; }
        .bubble-avatar { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0f4ff, #e8f1ff); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .bubble.user .bubble-avatar { background: linear-gradient(135deg, #007bff, #0056b3); color: white; }
        .bubble.support .bubble-avatar { background: linear-gradient(135deg, #1f786a, #2d9b7f); color: white; }
        .bubble-msg { display: flex; flex-direction: column; gap: 6px; padding: 10px; border-radius: 12px; font-size: 14px; }
        .bubble.user .bubble-msg { background: #007bff; color: white; }
        .bubble.support .bubble-msg { background: #e9e9eb; color: #333; }
        
        .loader-bubble { min-width: 52px; display: flex; align-items: center; justify-content: flex-start; }
        .typing-loader { display: inline-flex; align-items: center; gap: 6px; background: #dae5f5; padding: 10px 20px; border-radius: 30px; }
        .typing-loader span { width: 7px; height: 7px; border-radius: 50%; background: #8aafe6; animation: typingPulse 1.4s infinite ease-in-out; }
        .typing-loader span:nth-child(1) { animation-delay: 0s; }
        .typing-loader span:nth-child(2) { animation-delay: 0.2s; }
        .typing-loader span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingPulse { 0%, 80%, 100% { opacity: 0.4; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.1); } }
        .welcome-message { text-align: center; padding: 30px 20px; color: #666; }
        .welcome-message h2 { font-size: 18px; font-weight: bold; margin: 0 0 8px 0;  }
        .welcome-message p { font-size: 14px; margin: 0; line-height: 1.4; color: #333;}
        .input-box { display: flex; align-items: center; margin: 10px; border: 1px solid #d9dde3; border-radius: 12px; background: #fff; overflow: hidden; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .input-box:focus-within { border-color: #40a650; box-shadow: 0 0 0 2px rgba(64, 166, 80, 0.15); }
        .send-icon-btn { background: #28a745; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border: none; }
        .send-icon-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        input { flex: 1; border: none; padding: 12px; outline: none; font-size: 14px; background: transparent; }
      `}</style>

      <div className={`window ${isOpen ? 'open' : 'closed'}`}>
        <div className="header">
          <div className="header-title">
            <svg className="header-icon" xmlns="http://www.w3.org/2000/svg" width="25.977" height="20.487" viewBox="0 0 25.977 20.487" aria-hidden="true">
              <g transform="translate(.2 -.3)">
                <path d="M62.614 47.848l-.028-.026-.032-.031-.025-.022-.037-.032-.023-.018-.041-.032-.025-.018-.041-.029-.021-.013-.048-.031-.011-.006-.059-.033h-.008l-.064-.032h-.008l-.066-.029h-.005c-.048-.02-.1-.037-.146-.052h-.016l-.062-.017-.078-.027h-.02l-.061-.01h-.031l-.05-.006h-.164a1.658 1.658 0 0 0-1.655 1.655v1.069a.372.372 0 0 0 .372.372h2.567a.372.372 0 0 0 .372-.372v-1.089a1.642 1.642 0 0 0-.485-1.17zm-.259 1.868h-1.823v-.7a.911.911 0 0 1 1.823 0zm0 0" fill="#fff" stroke="#fff" strokeWidth=".4" transform="translate(-56.082 -43.958)" />
                <path d="M249.155 47.359a1.657 1.657 0 0 0-1.655 1.655v1.069a.372.372 0 0 0 .372.372h2.566a.372.372 0 0 0 .372-.372v-1.068a1.656 1.656 0 0 0-1.655-1.655zm.911 2.353h-1.823v-.7a.911.911 0 1 1 1.823 0zm0 0" fill="#fff" stroke="#fff" strokeWidth="1" transform="translate(-232.156 -43.954)" />
                <path d="M138.439 118.359h-5.134a.372.372 0 0 0-.372.372 2.939 2.939 0 0 0 5.878 0 .372.372 0 0 0-.372-.372zm-1.015 1.924a2.195 2.195 0 0 1-3.715-1.18h4.327a2.18 2.18 0 0 1-.612 1.18zm0 0" fill="#fff" stroke="#fff" strokeWidth="1" transform="translate(-124.692 -110.553)" />
                <path d="M19.665 17.81h-3.112a2.4 2.4 0 1 0 0 .744h3.112a4.521 4.521 0 0 0 4.516-4.516v-3.6A3.578 3.578 0 0 0 22.36 4.07V2.8a2.3 2.3 0 0 0-2.3-2.3H2.3A2.3 2.3 0 0 0 0 2.8v9.66a2.3 2.3 0 0 0 2.3 2.3h.78v4.2a.372.372 0 0 0 .619.278l5.028-4.476h11.336a2.3 2.3 0 0 0 2.3-2.3v-1.277a3.554 3.554 0 0 0 1.077-.3v3.15a3.776 3.776 0 0 1-3.775 3.775zm-5.482 2.026a1.655 1.655 0 1 1 1.655-1.655 1.654 1.654 0 0 1-1.655 1.656zm7.433-7.379a1.555 1.555 0 0 1-1.553 1.553H8.586a.372.372 0 0 0-.247.094l-4.515 4.019v-3.74a.372.372 0 0 0-.372-.372H2.3a1.555 1.555 0 0 1-1.556-1.554V2.8A1.555 1.555 0 0 1 2.3 1.244h17.763A1.555 1.555 0 0 1 21.617 2.8zm.744-7.638a2.836 2.836 0 0 1 0 5.616zm0 0" fill="#fff" stroke="#fff" strokeWidth="1" />
              </g>
            </svg>
            <div className="header-main">
              <span>Smiles Chat Assistant</span>
              <span className="header-subtitle">Your Virtual Assistant</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="icon-action-btn" 
              data-tooltip="Start New Chat" 
              onClick={startNewChat} 
              aria-label="Start New Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M20.2461 11.5556C20.2491 12.7288 19.975 13.8861 19.4461 14.9333C18.8189 16.1882 17.8547 17.2437 16.6616 17.9816C15.4684 18.7195 14.0934 19.1106 12.6905 19.1111C11.5173 19.1142 10.36 18.8401 9.31275 18.3111L4.24609 20L5.93498 14.9333C5.40603 13.8861 5.13192 12.7288 5.13498 11.5556C5.13552 10.1527 5.52664 8.77766 6.26451 7.58451C7.00238 6.39135 8.05787 5.42719 9.31275 4.80002C10.36 4.27107 11.5173 3.99697 12.6905 4.00003H13.135C14.9877 4.10224 16.7377 4.88426 18.0498 6.19634C19.3618 7.50843 20.1439 9.25837 20.2461 11.1111V11.5556Z" stroke="#FFFFFF" strokeWidth="1.25273" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.4993 8.29199V14.7087M9.29102 11.5003H15.7077" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="messages">
          {chat.length === 0 && (
            <div className="welcome-message">
              <h2>Welcome to Smiles Chat Assistant</h2>
              <p>We are here to help you with your queries.</p>
            </div>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`bubble ${msg.type}`}>
              <div className="bubble-avatar" aria-hidden="true">
                {msg.type === 'user' ? <UserBubbleIcon /> : <AgentBubbleIcon />}
              </div>
              <div className="bubble-msg">
                {isHtmlContent(msg.text) ? (
                  <div style={{ wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
                ) : (
                  <span>{renderTextWithLinks(msg.text)}</span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="bubble support loader-bubble">
              <span className="typing-loader">
                <span /><span /><span />
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M4 3l17 9-17 9 6-9z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatWindow;
