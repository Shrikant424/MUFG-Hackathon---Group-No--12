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
      
          p: ({ children }) => <span>{children}</span>,
 
          strong: ({ children }) => <strong>{children}</strong>,
       
          em: ({ children }) => <em>{children}</em>,
          br: () => <br />,
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;