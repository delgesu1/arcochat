// src/ChatPopup.js

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { FiMenu, FiMaximize2, FiMinimize2, FiX, FiEdit } from 'react-icons/fi'; // Added FiEdit
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { createAssistantConversation } from './api';
import './ChatPopup.css';
import ConversationHistory from './ConversationHistory';
import { getRandomQuestions } from './utils';
import { format, isToday, isYesterday } from 'date-fns';

const formatDateHeading = (date) => {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMMM dd');
  }
};

export const ChatPopup = forwardRef(({ isOpen, onClose, initialMessages, onUpdateMessages }, ref) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [conversationList, setConversationList] = useState(() => {
    const savedConversations = localStorage.getItem('conversationList');
    if (savedConversations) {
      return JSON.parse(savedConversations);
    }
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const conversations = [
      // { id: 1, title: "Vibrato Techniques for Beginners", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
      // { id: 2, title: "Proper Bow Hold for Smooth Sound", date: new Date(today - 4 * oneDay).toISOString().split('T')[0] },
      // { id: 3, title: "Scales Practice Routine", date: new Date(today - oneDay).toISOString().split('T')[0] },
      // { id: 4, title: "Improving Intonation", date: new Date(today - 3 * oneDay).toISOString().split('T')[0] },
      // { id: 5, title: "Shifting Positions Smoothly", date: today.toISOString().split('T')[0] },
      // { id: 6, title: "Developing a Strong Left-Hand Frame", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
      // { id: 7, title: "Bow Distribution Techniques", date: new Date(today - oneDay).toISOString().split('T')[0] },
      // { id: 8, title: "Mastering Spiccato Bowing", date: new Date(today - 4 * oneDay).toISOString().split('T')[0] },
      // { id: 9, title: "Effective Warm-up Exercises", date: new Date(today - 3 * oneDay).toISOString().split('T')[0] },
      // { id: 10, title: "Sight-Reading Strategies", date: today.toISOString().split('T')[0] },
      // { id: 11, title: "Practicing Difficult Passages", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
      // { id: 12, title: "Developing Vibrato Speed", date: new Date(today - 4 * oneDay).toISOString().split('T')[0] },
      // { id: 13, title: "Improving Tone Quality", date: new Date(today - oneDay).toISOString().split('T')[0] },
      // { id: 14, title: "Memorization Techniques for Violinists", date: new Date(today - 3 * oneDay).toISOString().split('T')[0] },
      // { id: 15, title: "Efficient Practice Schedule", date: today.toISOString().split('T')[0] },
      // { id: 16, title: "Overcoming Performance Anxiety", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
      // { id: 17, title: "Developing Musical Expressiveness", date: new Date(today - 4 * oneDay).toISOString().split('T')[0] },
      // { id: 18, title: "Proper Posture for Violinists", date: new Date(today - oneDay).toISOString().split('T')[0] },
      // { id: 19, title: "Choosing the Right Strings", date: new Date(today - 3 * oneDay).toISOString().split('T')[0] },
      // { id: 20, title: "Maintaining Your Violin", date: new Date(today - 2 * oneDay).toISOString().split('T')[0] },
    ];
    
    // Sort conversations by date, newest first
    return conversations.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputAreaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Function to save the current conversation state
  const saveCurrentConversation = (conversationId, messages) => {
    setConversationList(prevList => {
      const updatedList = prevList.map(conversation => 
        conversation.id === conversationId 
          ? { ...conversation, messages, date: new Date().toISOString() }
          : conversation
      );
      localStorage.setItem('conversationList', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  // Function to set the conversation title
  const setConversationTitle = (conversationId, title) => {
    setConversationList((prevList) => {
      const updatedList = prevList.map((conversation) => {
        if (conversation.id === conversationId) {
          return { ...conversation, title };
        }
        return conversation;
      });
      localStorage.setItem('conversationList', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  // Function to initialize the chat with welcome message
  const initializeChat = () => {
    const randomQuestions = getRandomQuestions(5);
    setSampleQuestions(randomQuestions);
    const welcomeMessage = {
      role: 'assistant',
      content: `🎻 Welcome! I'm Professor Arco AI, your violin mentor, trained with the most comprehensive collection of violin knowledge ever assembled, drawing from the greatest minds in pedagogy. Whether refining technique, enhancing musicality, or improving practice habits, I'm here to help. Let's make your journey productive and enjoyable! Try asking me one of these questions:`,
      sampleQuestions: randomQuestions
    };
    setMessages([welcomeMessage]);
  };

  // Use initializeChat when the component mounts
  useEffect(() => {
    initializeChat();
  }, []);

  // Reset input value when chat is closed
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    onUpdateMessages(messages);
  }, [messages, onUpdateMessages]);

  const handleSendMessage = async (content) => {
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInputValue(''); // Clear input after sending message

    // Check if this is the first user message
    if (messages.length === 1) {
      const newConversationId = Date.now(); // Generate a unique ID
      setCurrentConversationId(newConversationId);
      
      const newConversation = {
        id: newConversationId,
        title: content, // Use the first message as the title
        date: new Date().toISOString(),
        messages: newMessages
      };
      
      setConversationList(prevList => {
        const newList = [newConversation, ...prevList];
        localStorage.setItem('conversationList', JSON.stringify(newList));
        return newList;
      });
    } else {
      // Save the current conversation state
      saveCurrentConversation(currentConversationId, newMessages);
    }

    const assistantMessage = { role: 'assistant', content: '' };
    setMessages(prevMessages => [...prevMessages, assistantMessage]);

    setIsTyping(true);

    abortControllerRef.current = new AbortController();

    try {
      let fullAssistantResponse = '';
      await createAssistantConversation(
        content,
        (chunk) => {
          fullAssistantResponse += chunk;
          setMessages(prevMessages => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              const updatedMessage = {
                ...lastMessage,
                content: fullAssistantResponse,
              };
              return [...prevMessages.slice(0, -1), updatedMessage];
            }
            return prevMessages;
          });
        },
        abortControllerRef.current.signal
      );

      // Save the current conversation state after the final AI assistant message is received
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        saveCurrentConversation(currentConversationId, updatedMessages);
        return updatedMessages;
      });

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      if (error.name === 'AbortError') {
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'system', content: 'AI response was canceled.' },
        ]);
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'system', content: 'An error occurred while processing your request.' },
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

  const handleNewChat = () => {
    initializeChat();
    const newConversationId = Date.now(); // Use a unique ID
    setCurrentConversationId(newConversationId);
  };

  const selectConversation = (conversationId) => {
    // Save the current conversation before switching
    if (currentConversationId) {
      saveCurrentConversation(currentConversationId, messages);
    }

    const selectedConversation = conversationList.find(convo => convo.id === conversationId);
    if (selectedConversation) {
      setMessages(selectedConversation.messages || []);
      setCurrentConversationId(conversationId);
    }
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
  };

  const handleRenameConversation = (id, newTitle) => {
    setConversationList((prevList) => {
      const updatedList = prevList.map((conversation) =>
        conversation.id === id ? { ...conversation, title: newTitle } : conversation
      );
      localStorage.setItem('conversationList', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const handleDeleteConversation = (id) => {
    setConversationList((prevList) => {
      const updatedList = prevList.filter((conversation) => conversation.id !== id);
      localStorage.setItem('conversationList', JSON.stringify(updatedList));
      return updatedList;
    });
    if (currentConversationId === id) {
      initializeChat();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ConversationHistory
        conversations={conversationList}
        onSelectConversation={selectConversation}
        onClose={closeHistory}
        isOpen={isHistoryOpen}
        currentConversationId={currentConversationId}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      <div className={`chat-popup ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
        <div className="chat-header">
          <div className="header-left-buttons">
            <button className="hamburger-button" onClick={toggleHistory} aria-label="Toggle Conversation History">
              <FiMenu size={20} />
            </button>
            {/* New Chat Button */}
            <button className="new-chat-button" onClick={handleNewChat} aria-label="Start New Chat">
              <FiEdit size={20} />
            </button>
          </div>
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