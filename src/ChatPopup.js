import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { createThread, addMessage, runAssistant, streamAssistantResponse } from './api';
import './ChatPopup.css';
import { FaExpand, FaCompress } from 'react-icons/fa';

export const ChatPopup = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const cancelResponseRef = useRef(null);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      const thread = await createThread();
      setThreadId(thread.id);
    };
    initializeChat();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!threadId) return;

    setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);
    setIsTyping(true);
    setIsCancelled(false);

    try {
      await addMessage(threadId, message);
      const run = await runAssistant(threadId);

      let assistantResponse = '';
      cancelResponseRef.current = { isCancelled: false };

      await streamAssistantResponse(threadId, run.id, (token) => {
        if (cancelResponseRef.current.isCancelled) {
          throw new Error('Response cancelled');
        }
        assistantResponse += token;
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          if (newMessages[newMessages.length - 1].role === 'assistant') {
            newMessages[newMessages.length - 1].content = assistantResponse;
          } else {
            newMessages.push({ role: 'assistant', content: assistantResponse });
          }
          return newMessages;
        });
      });
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      if (error.message !== 'Response cancelled') {
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          if (newMessages[newMessages.length - 1].role === 'assistant') {
            newMessages.pop();
          }
          return [...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }];
        });
      }
    } finally {
      setIsTyping(false);
      cancelResponseRef.current = null;
    }
  };

  const handleCancelResponse = () => {
    if (cancelResponseRef.current) {
      cancelResponseRef.current.isCancelled = true;
    }
    setIsTyping(false);
    setIsCancelled(true);
    // Remove the last assistant message if it's incomplete
    setMessages(prevMessages => {
      const newMessages = [...prevMessages];
      if (newMessages[newMessages.length - 1].role === 'assistant') {
        newMessages.pop();
      }
      return newMessages;
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className={`chat-popup ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="chat-popup-header">
        <h3>Professor Arco</h3>
        <div className="header-buttons">
          <button onClick={toggleExpand} className="expand-button" aria-label={isExpanded ? "Compress chat" : "Expand chat"}>
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>
          <button onClick={onClose} className="close-button" aria-label="Close chat">×</button>
        </div>
      </div>
      <div className="chat-popup-content">
        <MessageList messages={messages} isTyping={isTyping} />
        <div ref={messagesEndRef} />
      </div>
      <InputArea 
        onSendMessage={handleSendMessage} 
        isTyping={isTyping} 
        onCancelResponse={handleCancelResponse}
        isCancelled={isCancelled}
      />
    </div>
  );
};