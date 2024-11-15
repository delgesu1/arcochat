import React from 'react';
import './ChatIcon.css';
import chatBoxIcon from './assets/ChatBoxIcon.png'; // Import the PNG icon

export const ChatIcon = ({ onClick }) => {
  return (
    <div className="chat-icon" onClick={onClick}>
      <img src={chatBoxIcon} alt="Chat Icon" /> {/* Use the PNG icon */}
    </div>
  );
};