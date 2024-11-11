import React, { useState, useEffect, useRef } from 'react';
import { ChatPopup } from './ChatPopup';
import { ChatIcon } from './ChatIcon';
import { createAssistantConversation } from './api';
import './App.css';

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const abortControllerRef = useRef(null);
  const [conversationList, setConversationList] = useState(() => {
    const savedConversations = localStorage.getItem('conversationList');
    return savedConversations ? JSON.parse(savedConversations) : [];
  });

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

  useEffect(() => {
    localStorage.setItem('conversationList', JSON.stringify(conversationList));
  }, [conversationList]);

  const togglePopup = () => {
    console.log('Toggling popup, current state:', isPopupOpen);
    setIsPopupOpen(prevState => !prevState);
  };

  const handleSendMessage = async (message) => {
    const modifiedContent = `${message} (Please find a relevant document(s) in your knowledge base and use that to answer me. Always provide specific examples and step by step exercises when appropriate. If you can't find answers in your knowledge-base, simply reply "I don't have information on that topic". Your output should be at least 4000 tokens.)`;

    try {
      const assistantResponse = await createAssistantConversation(
        modifiedContent,
        (chunk) => {
          setChatHistory((prevMessages) => {
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

      setChatHistory((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: assistantResponse },
      ]);
    } catch (error) {
      if (error.name === 'AbortError') {
        setChatHistory((prevMessages) => [
          ...prevMessages,
          { role: 'system', content: 'AI response was canceled.' },
        ]);
      } else {
        setChatHistory((prevMessages) => [
          ...prevMessages,
          { role: 'system', content: 'An error occurred while fetching the AI response.' },
        ]);
        console.error('Fetch error:', error);
      }
    } finally {
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
        onUpdateMessages={(updatedMessages) => {
          setConversationList(prevList => 
            prevList.map(convo => 
              convo.id === chatHistory.id 
                ? { ...convo, messages: updatedMessages } 
                : convo
            )
          );
        }}
      />
    </div>
  );
};

export default App;
