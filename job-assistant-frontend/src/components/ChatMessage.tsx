import React from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`w-full py-8 px-4 ${
        isUser ? "bg-user-msg" : "bg-assistant-msg"
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-sm flex items-center justify-center text-white font-semibold ${
              isUser ? "bg-purple-600" : "bg-green-600"
            }`}
          >
            {isUser ? "U" : "AI"}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 text-white overflow-hidden">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-4 last:mb-0 whitespace-pre-wrap break-words">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-4 mb-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-4 mb-4">{children}</ol>
                  ),
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-700 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
