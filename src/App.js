import React, { useState } from 'react';
import { ChatPopup } from './ChatPopup';
import { ChatIcon } from './ChatIcon';
import './App.css';

const App = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className="app">
      {!isPopupOpen && <ChatIcon onClick={togglePopup} />}
      <ChatPopup 
        isOpen={isPopupOpen} 
        onClose={togglePopup} 
      />
    </div>
  );
};

export default App;