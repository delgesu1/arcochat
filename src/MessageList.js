import React, { useRef, useEffect, useState } from 'react';
import { Message } from './Messages';
import './MessageList.css';

export const MessageList = ({ messages, isTyping, onSampleQuestionClick }) => {
  console.log('MessageList rendering, messages:', messages);
  
  const messageListRef = useRef(null);
  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator = isTyping && (!lastMessage || lastMessage.role !== 'assistant' || lastMessage.content === '');
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Scroll to the bottom of the chat container
  const scrollToBottom = () => {
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  };

  // useEffect(() => {
  //   const scrollToBottom = () => {
  //     if (messageListRef.current) {
  //       messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  //     }
  //   };

  //   scrollToBottom();
  //   const timeoutId = setTimeout(scrollToBottom, 100);
  //   return () => clearTimeout(timeoutId);
  // }, [messages, isTyping]);

  // Automatically scroll to the bottom when new messages are added
  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom();
    }
  }, [messages]);

  // Track user scroll behavior
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    setIsUserScrolling(!isAtBottom);
  };

  return (
    <div className="message-list" ref={messageListRef}  onScroll={handleScroll}>
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