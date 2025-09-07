import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownMessage = (props) => {
  const message = props.payload?.message || props.message || '';
  
  return (
    <div className="markdown-message">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize paragraph rendering to avoid extra spacing
          p: ({ children }) => <span>{children}</span>,
          // Ensure proper bold rendering
          strong: ({ children }) => <strong>{children}</strong>,
          // Handle other markdown elements as needed
          em: ({ children }) => <em>{children}</em>,
          // Handle line breaks properly
          br: () => <br />,
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;