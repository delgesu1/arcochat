import React, { useRef, useEffect } from 'react';
import { Message } from './Messages';
import './MessageList.css';

export const MessageList = ({ messages, isTyping, onSampleQuestionClick }) => {
  console.log('MessageList rendering, messages:', messages);
  
  const messageListRef = useRef(null);
  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator = isTyping && (!lastMessage || lastMessage.role !== 'assistant' || lastMessage.content === '');

  useEffect(() => {
    const scrollToBottom = () => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    };

    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  return (
    <div className="message-list" ref={messageListRef}>
      {messages.map((message, index) =>
        message && message.content ? (
          <Message 
            key={index} 
            role={message.role} 
            content={message.content}
            sampleQuestions={message.sampleQuestions}
            onSampleQuestionClick={onSampleQuestionClick}
          />
        ) : null
      )}
      {showTypingIndicator && (
        <div className="message assistant">
          <div className="message-content typing-indicator">
            ArcoAI is thinking...
          </div>
        </div>
      )}
    </div>
  );
};