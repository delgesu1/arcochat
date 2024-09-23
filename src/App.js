import React, { useState, useEffect, useRef } from 'react';
import { ChatPopup } from './ChatPopup';
import { ChatIcon } from './ChatIcon';
import { createAssistantConversation } from './api';
import './App.css';

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef(null);

  // Load chat history from localStorage when the app starts
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const togglePopup = () => {
    console.log('Toggling popup, current state:', isPopupOpen);
    setIsPopupOpen(prevState => !prevState);
  };

  const handleSendMessage = async (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
    ]);

    setIsTyping(true);
    abortControllerRef.current = new AbortController();

    try {
      // Silently append the additional sentence to the content
      const modifiedContent = `${message} (Please refer exclusively to your knowledge base and DO NOT make up information or use ANY outside knowledge. If what is being asked doesn't appear in your knowledge-base, simply reply "I don't have information on that topic".)`;

      const assistantResponse = await createAssistantConversation(
        modifiedContent,
        (chunk) => {
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              return [
                ...prevMessages.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + chunk },
              ];
            } else {
              return [...prevMessages, { role: 'assistant', content: chunk }];
            }
          });
        },
        abortControllerRef.current.signal
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: assistantResponse },
      ]);
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'system', content: 'AI response was canceled.' },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'system', content: 'An error occurred while fetching the AI response.' },
        ]);
        console.error('Fetch error:', error);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort the fetch request
    }
  };

  const updateChatHistory = (newMessages) => {
    setChatHistory(newMessages);
  };

  return (
    <div className="app">
      <ChatIcon onClick={togglePopup} />
      <ChatPopup
        isOpen={isPopupOpen}
        onClose={togglePopup}
        initialMessages={chatHistory}
        onUpdateMessages={updateChatHistory}
      />
    </div>
  );
};

export default App;