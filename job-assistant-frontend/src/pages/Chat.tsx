import React, { useState, useEffect, useRef } from "react";
import ChatInput from "../components/ChatInput";
import LoadingMessage from "../components/LoadingMessage";
import JobTable from "../components/JobTable";
import FullscreenTable from "../components/FullscreenTable";
import ThemeToggle from "../components/ThemeToggle";
import { chatAPI, Job, ParsedQuery } from "../services/api";
import { Message } from "../types";
import { useTheme } from "../contexts/ThemeContext";

interface MessageWithJobs extends Message {
  jobs?: Job[];
  totalMatches?: number; // ✅ NEW: Total match count
  parsedQuery?: ParsedQuery; // ✅ NEW: Agent's parsed query
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
      // ✅ Call NEW agent-chat API
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
        totalMatches: response.total_matches, // ✅ NEW: Store total count
        parsedQuery: response.parsed_query, // ✅ NEW: Store parsed query
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
          lastMessage.totalMatches = jobs.length;
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
              <p className="text-xs mt-1">Powered by Agentic RAG + GPT-4</p>
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
                    🤖 Agentic Job Search
                  </h1>
                  <p
                    className={`text-lg mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Intelligent multi-step job filtering powered by AI
                  </p>
                  <p
                    className={`text-sm mb-8 ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Try complex queries like "Python jobs in London over £60k
                    with visa"
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <button
                      onClick={() =>
                        handleSendMessage(
                          "Find Python jobs in London over £60000"
                        )
                      }
                      className={`rounded-lg p-4 text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "glass-card text-gray-800 border-0"
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      }`}
                    >
                      <div className="font-semibold mb-1">💰 Salary Filter</div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Find Python jobs in London over £60k
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          "Show remote React jobs with visa sponsorship"
                        )
                      }
                      className={`rounded-lg p-4 text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "glass-card text-gray-800 border-0"
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      }`}
                    >
                      <div className="font-semibold mb-1">🛂 Multi-Filter</div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Show remote React jobs with visa
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          "Find JavaScript developer jobs in Manchester"
                        )
                      }
                      className={`rounded-lg p-4 text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "glass-card text-gray-800 border-0"
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      }`}
                    >
                      <div className="font-semibold mb-1">
                        📍 Location Filter
                      </div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Find JavaScript jobs in Manchester
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          "Show all available software engineer positions"
                        )
                      }
                      className={`rounded-lg p-4 text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "glass-card text-gray-800 border-0"
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                      }`}
                    >
                      <div className="font-semibold mb-1">📋 Browse All</div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Show all software engineer positions
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
                            {/* ✅ NEW: Show parsed query info */}
                            {message.parsedQuery && (
                              <div
                                className={`mb-3 p-3 rounded-lg text-sm ${
                                  theme === "light"
                                    ? "bg-blue-50 border border-blue-200"
                                    : "bg-blue-900 bg-opacity-20 border border-blue-700"
                                }`}
                              >
                                <div className="font-semibold mb-2 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                  </svg>
                                  Agent Filters Applied:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {message.parsedQuery.skills.length > 0 && (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-xs">
                                      🎯 Skills:{" "}
                                      {message.parsedQuery.skills.join(", ")}
                                    </span>
                                  )}
                                  {message.parsedQuery.salary_min && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-xs">
                                      💰 Min: £
                                      {message.parsedQuery.salary_min.toLocaleString()}
                                    </span>
                                  )}
                                  {message.parsedQuery.location && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                                      📍 {message.parsedQuery.location}
                                    </span>
                                  )}
                                  {message.parsedQuery.visa_required && (
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded text-xs">
                                      🛂 Visa Required
                                    </span>
                                  )}
                                  {message.parsedQuery.remote && (
                                    <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900 rounded text-xs">
                                      🏠 Remote
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <p
                              className={`whitespace-pre-wrap mb-4 ${
                                theme === "light"
                                  ? "text-gray-900"
                                  : "text-white"
                              }`}
                            >
                              {message.content}
                            </p>

                            {/* ✅ NEW: Show total matches count prominently */}
                            {message.totalMatches !== undefined &&
                              message.totalMatches > 0 && (
                                <div
                                  className={`mb-3 p-2 rounded-lg inline-block ${
                                    theme === "light"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-green-900 bg-opacity-30 text-green-300"
                                  }`}
                                >
                                  <span className="font-semibold">
                                    📊 {message.totalMatches.toLocaleString()}{" "}
                                    jobs found
                                  </span>
                                  {message.jobs &&
                                    message.totalMatches >
                                      message.jobs.length && (
                                      <span className="ml-2 text-sm opacity-75">
                                        (showing top {message.jobs.length} in
                                        detail, all {message.totalMatches} in
                                        table)
                                      </span>
                                    )}
                                </div>
                              )}

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
