// src/ChatPopup.js

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { FiMenu, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { createAssistantConversation } from './api';
import './ChatPopup.css';
import ConversationHistory from './ConversationHistory';
import { getRandomQuestions } from './utils';

export const ChatPopup = forwardRef(({ isOpen, onClose }, ref) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [conversationList, setConversationList] = useState(() => {
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const conversations = [
      { id: 1, title: "Vibrato Techniques for Beginners", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
      { id: 2, title: "Proper Bow Hold for Smooth Sound", date: new Date(today - 4 * oneDay).toISOString().split('T')[0] },
      { id: 3, title: "Scales Practice Routine", date: new Date(today - oneDay).toISOString().split('T')[0] },
      { id: 4, title: "Improving Intonation", date: new Date(today - 3 * oneDay).toISOString().split('T')[0] },
      { id: 5, title: "Shifting Positions Smoothly", date: today.toISOString().split('T')[0] },
      { id: 6, title: "Developing a Strong Left-Hand Frame", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
      { id: 7, title: "Bow Distribution Techniques", date: new Date(today - oneDay).toISOString().split('T')[0] },
      { id: 8, title: "Mastering Spiccato Bowing", date: new Date(today - 4 * oneDay).toISOString().split('T')[0] },
      { id: 9, title: "Effective Warm-up Exercises", date: new Date(today - 3 * oneDay).toISOString().split('T')[0] },
      { id: 10, title: "Sight-Reading Strategies", date: today.toISOString().split('T')[0] },
      { id: 11, title: "Practicing Difficult Passages", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
      { id: 12, title: "Developing Vibrato Speed", date: new Date(today - 4 * oneDay).toISOString().split('T')[0] },
      { id: 13, title: "Improving Tone Quality", date: new Date(today - oneDay).toISOString().split('T')[0] },
      { id: 14, title: "Memorization Techniques for Violinists", date: new Date(today - 3 * oneDay).toISOString().split('T')[0] },
      { id: 15, title: "Efficient Practice Schedule", date: today.toISOString().split('T')[0] },
      { id: 16, title: "Overcoming Performance Anxiety", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
      { id: 17, title: "Developing Musical Expressiveness", date: new Date(today - 4 * oneDay).toISOString().split('T')[0] },
      { id: 18, title: "Proper Posture for Violinists", date: new Date(today - oneDay).toISOString().split('T')[0] },
      { id: 19, title: "Choosing the Right Strings", date: new Date(today - 3 * oneDay).toISOString().split('T')[0] },
      { id: 20, title: "Maintaining Your Violin", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
    ];
    
    // Sort conversations by date, newest first
    return conversations.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputAreaRef = useRef(null);
  const abortControllerRef = useRef(null);  // Add this line

  useEffect(() => {
    // Generate welcome message with random questions when the component mounts
    const randomQuestions = getRandomQuestions(5);
    setSampleQuestions(randomQuestions);
    const welcomeMessage = {
      role: 'assistant',
      content: `🎻 Welcome! I'm Professor Arco AI, your violin mentor, trained with the most comprehensive collection of violin knowledge ever assembled, drawing from the greatest minds in pedagogy. Whether refining technique, enhancing musicality, or improving practice habits, I'm here to help. Let's make your journey productive and enjoyable! Try asking me one of these questions:`,
      sampleQuestions: randomQuestions
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (content) => {
    // Add user's visible message to the message list
    setMessages(prevMessages => [...prevMessages, { role: 'user', content }]);

    // Silently append the additional sentence to the content
    const modifiedContent = `${content} (Please refer exclusively to your knowledge base and DO NOT make up information or use ANY outside knowledge. If what is being asked doesn't appear in your knowledge-base, simply reply "I don't have information on that topic".)`;

    // Add an empty assistant message to hold streaming content
    const assistantMessage = { role: 'assistant', content: '' };
    setMessages(prevMessages => [...prevMessages, assistantMessage]);

    setIsTyping(true);

    // Initialize AbortController to handle cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Use the modifiedContent in the API call
      await createAssistantConversation(modifiedContent, (chunk) => {
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            // Append the new chunk to the assistant's message
            const updatedMessage = {
              ...lastMessage,
              content: lastMessage.content + chunk,
            };
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = updatedMessage;
            return updatedMessages;
          } else {
            // If the last message isn't assistant, add a new one
            return [...prevMessages, { role: 'assistant', content: chunk }];
          }
        });
      }, abortControllerRef.current.signal);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handle fetch cancellation
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'system', content: 'AI response was canceled.' },
        ]);
        // Optionally, remove the empty assistant message
        setMessages(prevMessages => prevMessages.slice(0, -1));
      } else {
        console.error('Error in handleSendMessage:', error);
        let errorMessage = 'An error occurred while processing your request. ';
        if (error.message.includes('Rate limit')) {
          errorMessage += 'You are sending messages too quickly. Please wait and try again.';
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

  const handleQuestionClick = (question) => {
    setInputValue(question);
    setTimeout(() => {
      if (inputAreaRef.current) {
        inputAreaRef.current.focus();
      }
    }, 0);
  };

  const toggleView = () => {
    setIsExpanded(prev => !prev);
  };

  const toggleHistory = () => {
    setIsHistoryOpen(prev => !prev);
  };

  const selectConversation = (conversationId) => {
    console.log(`Selected conversation: ${conversationId}`);
    setIsHistoryOpen(false);
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <ConversationHistory
        conversations={conversationList}
        onSelectConversation={selectConversation}
        onClose={closeHistory}
        isOpen={isHistoryOpen}
      />
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
              onClick={() => setIsExpanded(prev => !prev)}
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
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
          onSampleQuestionClick={handleQuestionClick}
        />
        <div ref={messagesEndRef} />
        <InputArea
          ref={inputAreaRef}
          onSendMessage={handleSendMessage}
          onCancel={handleCancel}
          isTyping={isTyping}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
    </>
  );
});

export default ChatPopup;