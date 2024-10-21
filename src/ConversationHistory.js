import React, { useState } from 'react';
import { FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './ConversationHistory.css';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const formatDateHeading = (date) => {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMMM dd');
  }
};

const ConversationHistory = ({ 
  conversations, 
  onSelectConversation, 
  onClose, 
  isOpen, 
  currentConversationId, 
  onRenameConversation, 
  onDeleteConversation 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const groupConversationsByDate = (conversations) => {
    const grouped = conversations.reduce((acc, conversation) => {
      const date = parseISO(conversation.date);
      const heading = formatDateHeading(date);
      if (!acc[heading]) {
        acc[heading] = [];
      }
      acc[heading].push(conversation);
      return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => {
      if (a[0] === 'Today') return -1;
      if (b[0] === 'Today') return 1;
      if (a[0] === 'Yesterday') return -1;
      if (b[0] === 'Yesterday') return 1;
      return new Date(b[0]) - new Date(a[0]);
    });
  };

  const groupedConversations = groupConversationsByDate(conversations);

  const handleRenameClick = (id, title) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleRenameSubmit = (id) => {
    onRenameConversation(id, editingTitle);
    setEditingId(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteConversation(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

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
                {editingId === conversation.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit(conversation.id)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit(conversation.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up
                  />
                ) : (
                  <>
                    <span>{conversation.title}</span>
                    <div className="conversation-actions" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleRenameClick(conversation.id, conversation.title)} aria-label="Rename">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(conversation.id)} aria-label="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {deleteConfirmId && (
        <div className="delete-confirm-modal">
          <p>Are you sure you want to delete this conversation?</p>
          <button onClick={handleDeleteConfirm}>Delete</button>
          <button onClick={() => setDeleteConfirmId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;