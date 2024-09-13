import React from 'react';

export const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <input type="text" className="search-input" placeholder="Search" />
      </div>
      <div className="chat-history">
        <div className="chat-group">
          <div className="chat-group-title">Today</div>
          <div className="chat-item">Test Chat Summary</div>
          <div className="chat-item">AI Chatbot Interface Spec</div>
          <div className="chat-item">Advanced Vibrato Techniques</div>
        </div>
        <div className="chat-group">
          <div className="chat-group-title">Yesterday</div>
          <div className="chat-item">Técnicas de práctica violinística</div>
          <div className="chat-item">DOD Financial Accountability Is...</div>
        </div>
        {/* Add more chat groups as needed */}
      </div>
      <div className="user-profile">
        <div className="user-avatar">J</div>
        <div className="user-name">joe black</div>
      </div>
    </div>
  );
};