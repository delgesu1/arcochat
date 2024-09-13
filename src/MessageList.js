import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const Message = ({ role, content }) => {
  const [showCopyButton, setShowCopyButton] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    // Optionally, you can add a visual feedback here, like a temporary "Copied!" message
  };

  if (!content) return null;

  return (
    <div 
      className={`message ${role}`} 
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <div className="message-icon">{role === 'assistant' ? '🎻' : '👤'}</div>
      <div className="message-content">
        {role === 'assistant' ? (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
            {showCopyButton && (
              <button className="copy-button" onClick={handleCopy}>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            )}
          </>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

export const MessageList = ({ messages, isTyping }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <Message key={index} role={message.role} content={message.content} />
      ))}
      {isTyping && (
        <div className="message assistant">
          <div className="message-icon">🎻</div>
          <div className="message-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};