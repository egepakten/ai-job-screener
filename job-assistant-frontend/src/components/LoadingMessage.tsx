import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const LoadingMessage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="flex gap-4">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          theme === "light" ? "bg-green-500" : "bg-green-600"
        }`}
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex gap-1">
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              theme === "light" ? "bg-gray-400" : "bg-gray-500"
            }`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              theme === "light" ? "bg-gray-400" : "bg-gray-500"
            }`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              theme === "light" ? "bg-gray-400" : "bg-gray-500"
            }`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
