import React, { useState, useRef, useEffect } from 'react';

export const InputArea = ({ onSendMessage, isTyping, onCancelResponse }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isTyping) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-area">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isTyping}
        rows={1}
      />
      {isTyping ? (
        <button type="button" onClick={onCancelResponse} className="cancel-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="11" fill="currentColor" />
            <rect x="8" y="8" width="8" height="8" fill="#ffffff" />
          </svg>
        </button>
      ) : (
        <button type="submit" disabled={!message.trim() || isTyping}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="11" fill="currentColor" />
            <path d="M8 12l4-4 4 4m-4-4v8" stroke="#fff" strokeWidth="2" fill="none" />
          </svg>
        </button>
      )}
    </form>
  );
};