// src/ChatPopup.js

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { FiMenu, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi'; // Add FiMenu
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { createAssistantConversation } from './api';
import './ChatPopup.css';
import ConversationHistory from './ConversationHistory'; // New component we'll create
import { format, subDays } from 'date-fns'; // Make sure to install date-fns: npm install date-fns

export const ChatPopup = ({ isOpen, onClose }, ref) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef(null);
  const inputAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // State to manage view mode: popup or expanded sidebar
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState(() => {
    const today = new Date();
    return [
      { id: 1, title: "Vibrato Techniques for Beginners", date: format(today, 'yyyy-MM-dd') },
      { id: 2, title: "Improving Bow Control", date: format(today, 'yyyy-MM-dd') },
      { id: 3, title: "Left Hand Positioning Tips", date: format(today, 'yyyy-MM-dd') },
      { id: 4, title: "Mastering Spiccato Bowing", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 5, title: "Violin Posture and Ergonomics", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 6, title: "Intonation Exercises for Violinists", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 7, title: "Shifting Techniques: Smooth Transitions", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 8, title: "Double Stop Practice Strategies", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 9, title: "Developing a Rich Violin Tone", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 10, title: "Violin Fingering Charts and Tips", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 11, title: "Advanced Bowing Techniques", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 12, title: "Practicing Scales Effectively", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 13, title: "Violin Maintenance and Care", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 14, title: "Improving Sight-Reading Skills", date: format(subDays(today, 1), 'yyyy-MM-dd') },
      { id: 15, title: "Left Hand Tension Relief Exercises", date: format(subDays(today, 2), 'yyyy-MM-dd') },
      { id: 16, title: "Slow Practice Techniques for Accuracy", date: format(subDays(today, 2), 'yyyy-MM-dd') },
      { id: 17, title: "Vibrato Speed and Width Control", date: format(subDays(today, 2), 'yyyy-MM-dd') },
      { id: 18, title: "Bow Distribution for Long Phrases", date: format(subDays(today, 2), 'yyyy-MM-dd') },
      { id: 19, title: "Pizzicato Techniques for Violinists", date: format(subDays(today, 3), 'yyyy-MM-dd') },
      { id: 20, title: "Harmonics: Natural and Artificial", date: format(subDays(today, 3), 'yyyy-MM-dd') },
      { id: 21, title: "Violin Shoulder Rest Adjustments", date: format(subDays(today, 4), 'yyyy-MM-dd') },
      { id: 22, title: "Developing Consistent Violin Practice", date: format(subDays(today, 5), 'yyyy-MM-dd') },
      { id: 23, title: "Overcoming Performance Anxiety", date: format(subDays(today, 5), 'yyyy-MM-dd') },
    ];
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (content) => {
    const newMessage = { role: 'user', content };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setIsTyping(true);

    abortControllerRef.current = new AbortController();

    try {
      const assistantResponse = await createAssistantConversation(content, abortControllerRef.current.signal);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: assistantResponse },
      ]);
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Fetch aborted') {
        console.log('Fetch aborted');
        // Restore the user's message back to the input field
        if (inputAreaRef.current && typeof inputAreaRef.current.restoreMessage === 'function') {
          inputAreaRef.current.restoreMessage(content);
        }
        // Do not add any system message
      } else {
        console.error('Error in handleSendMessage:', error);
        let errorMessage = 'An error occurred while processing your request. ';
        if (error.message.includes('Run did not complete in time')) {
          errorMessage += 'The assistant is taking longer than expected to respond. Please try again.';
        } else {
          errorMessage += 'Please try again later or contact support if the problem persists.';
        }
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'system', content: errorMessage },
        ]);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Toggle between popup and expanded sidebar
  const toggleView = () => {
    setIsExpanded(prev => !prev);
  };

  const toggleHistory = () => {
    setIsHistoryOpen(prev => !prev);
  };

  const selectConversation = (conversationId) => {
    // Here you would implement the logic to load the selected conversation
    console.log(`Selected conversation: ${conversationId}`);
    setIsHistoryOpen(false); // Close the history popup after selection
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {isExpanded && (
        <ConversationHistory
          conversations={conversations}
          onSelectConversation={selectConversation}
          onClose={closeHistory}  // This function will be called when X is clicked
          isOpen={isHistoryOpen}
        />
      )}
      <div className={`chat-popup ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
        <div className="chat-header">
          {isExpanded && (
            <button className="hamburger-button" onClick={toggleHistory} aria-label="Toggle Conversation History">
              <FiMenu size={20} />
            </button>
          )}
          <h3>Professor ArcoAI</h3>
          <div className="header-buttons">
            <button
              className="toggle-button"
              onClick={toggleView}
              aria-label={isExpanded ? 'Collapse Chat Sidebar' : 'Expand Chat Sidebar'}
              title={isExpanded ? 'Collapse Chat Sidebar' : 'Expand Chat Sidebar'}
            >
              {isExpanded ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
            </button>
            <button className="close-button" onClick={onClose} aria-label="Close Chat">
              <FiX size={20} />
            </button>
          </div>
        </div>
        <MessageList messages={messages} isTyping={isTyping} />
        <div ref={messagesEndRef} />
        <InputArea
          ref={inputAreaRef}
          onSendMessage={handleSendMessage}
          onCancel={handleCancel}
          isTyping={isTyping}
        />
      </div>
    </>
  );
};

// Forward ref if needed elsewhere
export default forwardRef(ChatPopup);