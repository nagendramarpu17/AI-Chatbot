import React, { useEffect, useState } from 'react';
import ChatWindow from './ChatWindow';

function App({ siteKey }) {
  const CLOSE_ANIMATION_MS = 320;
  const [isOpen, setIsOpen] = useState(false);
  const [showLauncher, setShowLauncher] = useState(true);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setShowLauncher(false);
    } else {
      timer = setTimeout(() => setShowLauncher(true), CLOSE_ANIMATION_MS);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <>
      <style>{`
        .launcher { 
          position: fixed; 
          bottom: 50px; 
          right: 50px; 
          width: 50px; 
          height: 50px; 
          background: #28a745; 
          color: white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 24px; 
          cursor: pointer; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.2); 
          z-index: 9999; 
          transition: transform 0.2s;
        }
        .launcher-icon {
          width: 22px;
          height: 18px;
        }
        .launcher::before {
          content: '';
          position: absolute;
          inset: -14px;
          border: 14px solid rgba(217, 217, 217, 0.8);
          border-radius: 50%;
          z-index: -1;
          pointer-events: none;
          animation: ringPulse 1.4s ease-in-out infinite;
        }
        .launcher:hover { transform: scale(1.05); }
        @media (max-width: 768px) {
          .launcher {
            right: 16px;
            bottom: 16px;
            width: 50px;
            height: 50px;
          }
          .launcher-icon {
            width: 20px;
            height: 16px;
          }
          .launcher::before {
            inset: -12px;
            border-width: 12px;
          }
        }
        @media (max-width: 480px) {
          .launcher {
            right: 14px;
            bottom: 14px;
            width: 48px;
            height: 48px;
          }
          .launcher-icon {
            width: 18px;
            height: 14px;
          }
          .launcher::before {
            inset: -10px;
            border-width: 10px;
          }
        }
        @keyframes ringPulse {
          0% {
            transform: scale(0.92);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.95;
          }
          100% {
            transform: scale(0.92);
            opacity: 0.55;
          }
        }
      `}</style>

      {showLauncher && (
        <div
          className="launcher"
          onClick={() => {
            setShowLauncher(false);
            setIsOpen(true);
          }}
        >
          <svg className="launcher-icon" xmlns="http://www.w3.org/2000/svg" width="25.977" height="20.487" viewBox="0 0 25.977 20.487" aria-hidden="true">
            <g transform="translate(.2 -.3)">
              <path
                d="M62.614 47.848l-.028-.026-.032-.031-.025-.022-.037-.032-.023-.018-.041-.032-.025-.018-.041-.029-.021-.013-.048-.031-.011-.006-.059-.033h-.008l-.064-.032h-.008l-.066-.029h-.005c-.048-.02-.1-.037-.146-.052h-.016l-.062-.017-.078-.027h-.02l-.061-.01h-.031l-.05-.006h-.164a1.658 1.658 0 0 0-1.655 1.655v1.069a.372.372 0 0 0 .372.372h2.567a.372.372 0 0 0 .372-.372v-1.089a1.642 1.642 0 0 0-.485-1.17zm-.259 1.868h-1.823v-.7a.911.911 0 0 1 1.823 0zm0 0"
                fill="#fff"
                stroke="#fff"
                strokeWidth=".4"
                transform="translate(-56.082 -43.958)"
              />
              <path
                d="M249.155 47.359a1.657 1.657 0 0 0-1.655 1.655v1.069a.372.372 0 0 0 .372.372h2.566a.372.372 0 0 0 .372-.372v-1.068a1.656 1.656 0 0 0-1.655-1.655zm.911 2.353h-1.823v-.7a.911.911 0 1 1 1.823 0zm0 0"
                fill="#fff"
                stroke="#fff"
                strokeWidth=".4"
                transform="translate(-232.156 -43.954)"
              />
              <path
                d="M138.439 118.359h-5.134a.372.372 0 0 0-.372.372 2.939 2.939 0 0 0 5.878 0 .372.372 0 0 0-.372-.372zm-1.015 1.924a2.195 2.195 0 0 1-3.715-1.18h4.327a2.18 2.18 0 0 1-.612 1.18zm0 0"
                fill="#fff"
                stroke="#fff"
                strokeWidth=".4"
                transform="translate(-124.692 -110.553)"
              />
              <path
                d="M19.665 17.81h-3.112a2.4 2.4 0 1 0 0 .744h3.112a4.521 4.521 0 0 0 4.516-4.516v-3.6A3.578 3.578 0 0 0 22.36 4.07V2.8a2.3 2.3 0 0 0-2.3-2.3H2.3A2.3 2.3 0 0 0 0 2.8v9.66a2.3 2.3 0 0 0 2.3 2.3h.78v4.2a.372.372 0 0 0 .619.278l5.028-4.476h11.336a2.3 2.3 0 0 0 2.3-2.3v-1.277a3.554 3.554 0 0 0 1.077-.3v3.15a3.776 3.776 0 0 1-3.775 3.775zm-5.482 2.026a1.655 1.655 0 1 1 1.655-1.655 1.654 1.654 0 0 1-1.655 1.656zm7.433-7.379a1.555 1.555 0 0 1-1.553 1.553H8.586a.372.372 0 0 0-.247.094l-4.515 4.019v-3.74a.372.372 0 0 0-.372-.372H2.3a1.555 1.555 0 0 1-1.556-1.554V2.8A1.555 1.555 0 0 1 2.3 1.244h17.763A1.555 1.555 0 0 1 21.617 2.8zm.744-7.638a2.836 2.836 0 0 1 0 5.616zm0 0"
                fill="#fff"
                stroke="#fff"
                strokeWidth=".4"
              />
            </g>
          </svg>
        </div>
      )}

      {/* Passing siteKey down to ChatWindow */}
      <ChatWindow isOpen={isOpen} setIsOpen={setIsOpen} siteKey={siteKey} />
    </>
  );
}

export default App;