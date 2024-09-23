import React from 'react';
import { FiX } from 'react-icons/fi';
import './ConversationHistory.css';
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

const ConversationHistory = ({ conversations, onSelectConversation, onClose, isOpen, currentConversationId }) => {
  if (!isOpen) return null;

  const groupConversationsByDate = (conversations) => {
    const grouped = conversations.reduce((acc, conversation) => {
      const date = new Date(conversation.date);
      const heading = formatDateHeading(date);
      if (!acc[heading]) {
        acc[heading] = [];
      }
      acc[heading].push(conversation);
      return acc;
    }, {});

    return Object.entries(grouped);
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
                className={`conversation-item ${conversation.id === currentConversationId ? 'active' : ''}`}
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