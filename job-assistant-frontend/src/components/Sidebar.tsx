import React from "react";

interface SidebarProps {
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  return (
    <div className="w-64 bg-gray-900 h-full flex flex-col border-r border-gray-700">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full bg-transparent hover:bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 flex items-center gap-3 transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-gray-400 text-xs font-semibold mb-2 px-2">
          Recent Conversations
        </div>
        {/* Placeholder for chat history - can be implemented later */}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-gray-400 text-sm">
          <p className="font-semibold">Job Assistant AI</p>
          <p className="text-xs mt-1">Powered by GPT-4</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
