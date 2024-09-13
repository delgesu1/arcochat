import React from 'react';
import ReactMarkdown from 'react-markdown';

export const Message = ({ role, content }) => {
  if (!content) return null;

  return (
    <div className={`message ${role}`}>
      <div className="message-content">
        {role === 'assistant' ? (
          <ReactMarkdown>{content}</ReactMarkdown>
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
        message && message.content ? (
          <Message
            key={index}
            role={message.role}
            content={message.content}
          />
        ) : null
      ))}
      {isTyping && (
        <div className="message assistant">
          <div className="typing-indicator">AI is typing...</div>
        </div>
      )}
    </div>
  );
};