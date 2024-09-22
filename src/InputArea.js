import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './InputArea.css';

export const InputArea = forwardRef(({ onSendMessage, onCancel, isTyping }, ref) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Expose the restoreMessage method to parent via ref
  useImperativeHandle(ref, () => ({
    restoreMessage: (msg) => {
      setMessage(msg);
      // Optionally, focus the textarea after restoring
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
  }));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'; // Reset to default height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleCancel = () => {
    if (isTyping) {
      onCancel();
    }
  };

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={isTyping}
        rows={1}
      />
      <button
        className={`send-button ${isTyping ? 'stop-button' : ''}`}
        onClick={isTyping ? handleCancel : handleSend}
        disabled={!isTyping && !message.trim()}
        aria-label={isTyping ? "Cancel AI Response" : "Send message"}
      >
        {isTyping ? (
          /* Stop (Cancel) icon */
          <svg viewBox="0 0 24 24">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          /* Send icon */
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        )}
      </button>
    </div>
  );
});