import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import './InputArea.css';

export const InputArea = forwardRef(({ onSendMessage, onCancel, isTyping, value, onChange }, ref) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessage(value);
  }, [value]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 24)}px`;
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onChange(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      adjustTextareaHeight();
    }
  };

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={isTyping}
        rows={1}  // Start with one row
      />
      <button
        className={`send-button ${isTyping ? 'stop-button' : ''}`}
        onClick={isTyping ? onCancel : handleSend}
        disabled={!message.trim() && !isTyping}
        aria-label={isTyping ? "Stop generating" : "Send message"}
      >
        {isTyping ? <FiX /> : <FiSend />}
      </button>
    </div>
  );
});