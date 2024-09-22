import React, { useState, useEffect, useRef } from 'react';
import { ChatPopup } from './ChatPopup';
import { ChatIcon } from './ChatIcon';
import { testAPIConnection } from './api';
import './App.css';

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    testAPIConnection().then(result => {
      if (!result) {
        console.error('Failed to connect to OpenAI API. Please check your API key and permissions.');
      }
    });
  }, []);

  const togglePopup = () => {
    console.log('Toggling popup, current state:', isPopupOpen);
    setIsPopupOpen(prevState => !prevState);
  };

  const handleSendMessage = async (message) => {
    // Add user's message to the message list
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
    ]);

    // Set isTyping to true to indicate AI is generating a response
    setIsTyping(true);

    // Initialize AbortController to handle cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Replace the following fetch URL with your AI backend endpoint
      const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: message }),
        signal: abortControllerRef.current.signal, // Attach the AbortController's signal
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Add AI's response to the message list
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: data.response },
      ]);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handle fetch cancellation
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'system', content: 'AI response was canceled.' },
        ]);
      } else {
        // Handle other errors
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

  return (
    <div className="app">
      <ChatIcon onClick={togglePopup} />
      <ChatPopup
        isOpen={isPopupOpen}
        onClose={togglePopup}
        messages={messages}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default App;