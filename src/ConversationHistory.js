import React from 'react';
import { FiX } from 'react-icons/fi';
import './ConversationHistory.css';

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

const formatDate = (date) => {
  const options = { month: 'long', day: '2-digit' };
  return date.toLocaleDateString(undefined, options);
};

const ConversationHistory = ({ conversations, onSelectConversation, onClose, isOpen }) => {
  const groupConversationsByDate = (conversations) => {
    const grouped = {};
    
    // Sort conversations by date, newest first
    const sortedConversations = [...conversations].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedConversations.forEach(conversation => {
      const date = new Date(conversation.date);
      let groupTitle;

      if (isToday(date)) {
        groupTitle = 'Today';
      } else if (isYesterday(date)) {
        groupTitle = 'Yesterday';
      } else {
        groupTitle = formatDate(date);
      }

      if (!grouped[groupTitle]) {
        grouped[groupTitle] = [];
      }
      grouped[groupTitle].push(conversation);
    });
    
    // Sort the group titles (dates) from newest to oldest
    const sortedGroups = Object.entries(grouped).sort((a, b) => {
      if (a[0] === 'Today') return -1;
      if (b[0] === 'Today') return 1;
      if (a[0] === 'Yesterday') return -1;
      if (b[0] === 'Yesterday') return 1;
      return new Date(b[0]) - new Date(a[0]);
    });
    
    return sortedGroups;
  };

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <div className={`conversation-history ${isOpen ? 'open' : ''}`}>
      <div className="conversation-history-header">
        <h4>Conversation History</h4>
        <button className="close-history-button" onClick={onClose} aria-label="Close History">
          <FiX size={20} />
        </button>
      </div>
      <div className="conversation-list-container">
        {groupedConversations.map(([date, convos]) => (
          <div key={date} className="conversation-group">
            <div className="conversation-group-title">{date}</div>
            {convos.map((conversation) => (
              <div 
                key={conversation.id} 
                className="conversation-item"
                onClick={() => onSelectConversation(conversation.id)}
              >
                {conversation.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationHistory;