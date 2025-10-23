import React, { useState, useEffect, useRef } from "react";
import ChatInput from "../components/ChatInput";
import LoadingMessage from "../components/LoadingMessage";
import JobTable from "../components/JobTable";
import FullscreenTable from "../components/FullscreenTable";
import ThemeToggle from "../components/ThemeToggle";
import { chatAPI, Job } from "../services/api";
import { Message } from "../types";
import { useTheme } from "../contexts/ThemeContext";

interface MessageWithJobs extends Message {
  jobs?: Job[];
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<MessageWithJobs[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<Job[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(`session-${Date.now()}`);
  const { theme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: MessageWithJobs = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Set loading state
    setIsLoading(true);

    try {
      // Call API
      const response = await chatAPI.sendMessage(content, {
        sessionId: sessionId.current,
      });

      // Add assistant message with jobs data
      const assistantMessage: MessageWithJobs = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        jobs:
          response.jobs && response.jobs.length > 0 ? response.jobs : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: MessageWithJobs = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    sessionId.current = `session-${Date.now()}`;
  };

  const handleExpandTable = (jobs: Job[]) => {
    setExpandedJobs(jobs);
  };

  const handleCloseFullscreen = () => {
    setExpandedJobs(null);
  };

  const handleJobsUpdate = (jobs: Job[]) => {
    // Update the last message with new jobs
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.jobs = jobs;
        }
      }
      return newMessages;
    });
    setExpandedJobs(jobs);
  };

  return (
    <>
      <div
        className={`flex h-screen ${
          theme === "light" ? "glass-background" : "bg-gray-900"
        }`}
      >
        {/* Sidebar */}
        <div
          className={`w-64 flex flex-col ${
            theme === "light"
              ? "glass-sidebar"
              : "bg-gray-800 border-r border-gray-700"
          }`}
        >
          <div
            className={`p-4 ${
              theme === "light"
                ? "border-b border-gray-300"
                : "border-b border-gray-700"
            } flex items-center justify-between`}
          >
            <h1
              className={`text-xl font-bold ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Job Assistant AI
            </h1>
            <ThemeToggle />
          </div>

          <div className="p-3">
            <button
              onClick={handleNewChat}
              className={`w-full rounded-lg px-4 py-3 flex items-center gap-3 transition-colors duration-200 ${
                theme === "light"
                  ? "glass-button text-gray-700 border-0"
                  : "bg-transparent hover:bg-gray-700 text-white border border-gray-600"
              }`}
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

          <div className="flex-1 px-3 py-2">
            <div
              className={`text-xs font-semibold mb-2 px-2 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Recent Conversations
            </div>
          </div>

          <div
            className={`p-4 ${
              theme === "light"
                ? "border-t border-gray-300"
                : "border-t border-gray-700"
            }`}
          >
            <div
              className={`text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              <p className="font-semibold">Job Assistant AI</p>
              <p className="text-xs mt-1">Powered by GPT-4</p>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div
                  className={`text-center px-4 ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  <h1
                    className={`text-4xl font-bold mb-4 ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    Job Assistant AI
                  </h1>
                  <p
                    className={`text-lg mb-8 ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Ask me anything about the available job positions
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <button
                      onClick={() =>
                        handleSendMessage("What job positions are available?")
                      }
                      className={`rounded-lg p-4 text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "glass-card text-gray-800 border-0"
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      }`}
                    >
                      <div className="font-semibold mb-1">📋 Browse Jobs</div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        What job positions are available?
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage("Show me high paying jobs")
                      }
                      className={`rounded-lg p-4 text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "glass-card text-gray-800 border-0"
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      }`}
                    >
                      <div className="font-semibold mb-1">
                        💰 High Paying Jobs
                      </div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Show me high paying jobs
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage("What are the job requirements?")
                      }
                      className={`rounded-lg p-4 text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "glass-card text-gray-800 border-0"
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      }`}
                    >
                      <div className="font-semibold mb-1">📝 Requirements</div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        What are the job requirements?
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage("Tell me about remote positions")
                      }
                      className={`rounded-lg p-4 text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "glass-card text-gray-800 border-0"
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      }`}
                    >
                      <div className="font-semibold mb-1">🏠 Remote Work</div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Tell me about remote positions
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${
                      theme === "light"
                        ? "border-b border-gray-200"
                        : "border-b border-gray-700"
                    }`}
                  >
                    <div className="max-w-4xl mx-auto px-6 py-6">
                      {/* User Message */}
                      {message.role === "user" ? (
                        <div className="flex gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              theme === "light" ? "bg-blue-500" : "bg-blue-600"
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p
                              className={`whitespace-pre-wrap ${
                                theme === "light"
                                  ? "text-gray-900"
                                  : "text-white"
                              }`}
                            >
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Assistant Message */
                        <div className="flex gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              theme === "light"
                                ? "bg-green-500"
                                : "bg-green-600"
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
                            <p
                              className={`whitespace-pre-wrap mb-4 ${
                                theme === "light"
                                  ? "text-gray-900"
                                  : "text-white"
                              }`}
                            >
                              {message.content}
                            </p>
                            {message.jobs && message.jobs.length > 0 && (
                              <JobTable
                                jobs={message.jobs}
                                onExpand={() =>
                                  handleExpandTable(message.jobs!)
                                }
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div
                    className={`${
                      theme === "light"
                        ? "border-b border-gray-200"
                        : "border-b border-gray-700"
                    }`}
                  >
                    <div className="max-w-4xl mx-auto px-6 py-6">
                      <LoadingMessage />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div
            className={`${
              theme === "light"
                ? "border-t border-gray-200"
                : "border-t border-gray-700"
            }`}
          >
            <div className="max-w-4xl mx-auto px-6 py-4">
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Table View */}
      {expandedJobs && (
        <FullscreenTable
          jobs={expandedJobs}
          onClose={handleCloseFullscreen}
          onJobsUpdate={handleJobsUpdate}
        />
      )}
    </>
  );
};

export default Chat;
