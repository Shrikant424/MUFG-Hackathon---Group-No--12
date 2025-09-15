 import React from 'react';

  const PromptButtons = ({ actionProvider }) => {
    const prompts = [
      { text: "Show my profile", query: "show my profile" },
      { text: "Risk Analysis", query: "Analyze my investment risk" },
      { text: "Stock Recommendations", query: "Recommend stocks for me" },
      { text: "Retirement Planning", query: "Help me plan for retirement" }
    ];

    const handlePromptClick = (query) => {
      // Trigger the action provider's handleDefault method
      if (actionProvider && actionProvider.handleDefault) {
        actionProvider.handleDefault(query);
      }
    };

    return (
      <div className="prompt-buttons-container">
        <div className="prompt-buttons-label">Quick Actions:</div>
        <div className="prompt-buttons-grid">
          {prompts.map((prompt, index) => (
            <button
              key={index}
              className="prompt-button"
              onClick={() => handlePromptClick(prompt.query)}
            >
              {prompt.text}
            </button>
          ))}
        </div>
      </div>
    );
  };

  export default PromptButtons;