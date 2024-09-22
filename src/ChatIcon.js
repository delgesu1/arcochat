import React from 'react';
import './ChatIcon.css';

export const ChatIcon = ({ onClick }) => {
  return (
    <div className="chat-icon" onClick={onClick}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 3C7.031 3 3 6.656 3 11c0 2.328 1.141 4.438 3 5.938V21l4.031-2.859C10.687 18.281 11.328 18.375 12 18.375c4.969 0 9-3.656 9-8s-4.031-7.375-9-7.375z" />
      </svg>
    </div>
  );
};