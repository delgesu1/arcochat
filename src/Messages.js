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

  // Function to remove citation markers
  const removeCitationMarkers = (text) => {
    // Remove anything between 【 】, including the markers
    text = text.replace(/【[^】]*】/g, '');
    
    // Remove any remaining numbered citations like [1], [2], etc.
    text = text.replace(/\[\d+\]/g, '');
    
    return text;
  };

  const processedContent = role === 'assistant' ? removeCitationMarkers(content) : content;

  const handleCopy = () => {
    // Convert Markdown to HTML
    const htmlContent = marked(processedContent);
    
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
          {processedContent}
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