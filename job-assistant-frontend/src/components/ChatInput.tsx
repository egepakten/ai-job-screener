import React, { useState, KeyboardEvent } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about jobs..."
            disabled={disabled}
            rows={1}
            className={`w-full rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === "light"
                ? "glass-input text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                : "bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500"
            }`}
            style={{
              minHeight: "52px",
              maxHeight: "200px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "52px";
              target.style.height = target.scrollHeight + "px";
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 font-medium transition-colors duration-200 flex-shrink-0 ${
            theme === "light"
              ? "glass-button-primary hover:bg-blue-600 disabled:bg-gray-400"
              : "bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600"
          }`}
          style={{ height: "52px" }}
        >
          Send
        </button>
      </div>
      <p
        className={`text-xs text-center mt-3 ${
          theme === "light" ? "text-gray-500" : "text-gray-400"
        }`}
      >
        Job Assistant AI can make mistakes. Consider checking important
        information.
      </p>
    </div>
  );
};

export default ChatInput;
