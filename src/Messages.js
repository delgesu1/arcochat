// src/Messages.js

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiCopy } from 'react-icons/fi'; // Import the copy icon
import { marked } from 'marked'; // Import the marked library
import './Messages.css';

export const Message = ({ role, content, sampleQuestions, onSampleQuestionClick }) => {
  console.log('Message rendering, role:', role, 'content:', content); // Add this log
  
  const [isCopied, setIsCopied] = useState(false);

  if (!content) return null;

  const handleCopy = () => {
    // Convert Markdown to HTML
    const htmlContent = marked(content);
    
    // Use a temporary element to strip HTML tags for plain text
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    const plainText = tempElement.textContent || tempElement.innerText;

    // Copy the HTML content to clipboard
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' })
      })
    ]).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className={`message ${role}`}>
      <div className="message-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
        {sampleQuestions && sampleQuestions.length > 0 && (
          <div className="sample-questions">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                className="sample-question-button"
                onClick={() => onSampleQuestionClick(question)}
              >
                <span className="question-text">{question}</span>
                <span className="question-arrow">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {role === 'assistant' && content && (
        <button className="copy-button" onClick={handleCopy} title="Copy to clipboard">
          <FiCopy />
          {isCopied && <span className="copied-tooltip">Copied!</span>}
        </button>
      )}
    </div>
  );
};

export const MessageList = ({ messages, isTyping }) => {
  const messageListRef = useRef(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    };

    // Scroll immediately
    scrollToBottom();

    // And then scroll again after a short delay to ensure all content has rendered
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  return (
    <div className="message-list" ref={messageListRef}>
      {messages.map((message, index) =>
        message && message.content ? (
          <Message 
            key={index} 
            role={message.role} 
            content={message.content}
            sampleQuestions={message.sampleQuestions}
            onSampleQuestionClick={message.onSampleQuestionClick}
          />
        ) : null
      )}
      {isTyping && (
        <div className="message assistant typing-indicator">
          AI is typing...
        </div>
      )}
    </div>
  );
};