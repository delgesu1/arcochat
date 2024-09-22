// src/Messages.js

import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Messages.css';

export const Message = ({ role, content }) => {
  if (!content) return null;

  return (
    <div className={`message ${role}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const MessageList = ({ messages, isTyping }) => {
  const messageListRef = useRef(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    };

    // Scroll immediately
    scrollToBottom();

    // And then scroll again after a short delay to ensure all content has rendered
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  return (
    <div className="message-list" ref={messageListRef}>
      {messages.map((message, index) =>
        message && message.content ? (
          <Message key={index} role={message.role} content={message.content} />
        ) : null
      )}
      {isTyping && (
        <div className="message assistant typing-indicator">
          AI is typing...
        </div>
      )}
    </div>
  );
};