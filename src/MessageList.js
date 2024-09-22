import React from 'react';
import { Message } from './Messages';
import './MessageList.css';

export const MessageList = ({ messages, isTyping }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) =>
        message && message.content ? (
          <Message key={index} role={message.role} content={message.content} />
        ) : null
      )}
      {isTyping && (
        <div className="message assistant">
          <div className="message-content typing-indicator">
            The assistant is typing...
          </div>
        </div>
      )}
    </div>
  );
};