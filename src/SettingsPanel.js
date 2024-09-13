import React from 'react';

export const SettingsPanel = ({ isDarkMode, toggleDarkMode, onClearConversation }) => {
  return (
    <div className="settings-panel">
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <button onClick={onClearConversation}>Clear Conversation</button>
    </div>
  );
};