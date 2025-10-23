import React, { useState } from "react";
import { Job } from "../services/api";
import { chatAPI } from "../services/api";
import { useChat } from "../contexts/ChatContext";
import { Message } from "../types";

interface FullscreenTableProps {
  jobs: Job[];
  onClose: () => void;
  onJobsUpdate: (jobs: Job[]) => void;
}

const FullscreenTable: React.FC<FullscreenTableProps> = ({
  jobs,
  onClose,
  onJobsUpdate,
}) => {
  const [currentJobs, setCurrentJobs] = useState<Job[]>(jobs);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const { sessionId } = useChat();

  // Trigger animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 50);
    return () => clearTimeout(timer);
  }, []);

  const downloadCSV = () => {
    if (currentJobs.length === 0) return;

    const headers = [
      "Title",
      "Company",
      "Salary",
      "Location",
      "Tech Stack",
      "Visa Sponsorship",
      "Link",
    ];
    const rows = currentJobs.map((job) => [
      job.title,
      job.company,
      job.salary,
      job.location,
      job.tech_stack.join("; "),
      job.visa_sponsorship,
      job.link,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const content = inputValue.trim();
    setInputValue("");

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(content, { sessionId });

      // Update jobs if we got new results
      if (response.jobs && response.jobs.length > 0) {
        setCurrentJobs(response.jobs);
        onJobsUpdate(response.jobs);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content:
          response.answer +
          (response.jobs && response.jobs.length > 0
            ? `\n\n✅ Table updated with ${response.total_matches} jobs!`
            : ""),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-900 z-50 flex transition-all duration-300 ${
        isAnimating ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Left Sidebar - Chat */}
      <div
        className={`bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed
            ? "w-0 opacity-0 overflow-hidden"
            : "w-96 opacity-100"
        }`}
        style={{
          transform: isSidebarCollapsed ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Refine Results</h3>
          <p className="text-sm text-gray-400 mt-1">
            Ask questions to improve the table
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">
                Ask questions to filter or sort the table
              </p>
              <div className="mt-4 text-xs space-y-2">
                <p>• "Show only remote jobs"</p>
                <p>• "Sort by highest salary"</p>
                <p>• "Filter by Python skills"</p>
              </div>
            </div>
          ) : (
            chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-300">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about the jobs..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Table */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Table Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          {/* Left side - Toggle Sidebar + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title={
                isSidebarCollapsed ? "Show chat sidebar" : "Hide chat sidebar"
              }
            >
              <svg
                className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${
                  isSidebarCollapsed ? "rotate-0" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-white">Job Results</h2>
            <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
              {currentJobs.length} {currentJobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 flex items-center gap-2 transition-colors"
            >
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download CSV
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 flex items-center gap-2 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Close
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Tech Stack
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Visa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentJobs.map((job, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {job.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-400">
                        {job.company}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-400 font-semibold">
                        {job.salary}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {job.location}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {job.tech_stack.slice(0, 5).map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300"
                            >
                              {tech}
                            </span>
                          ))}
                          {job.tech_stack.length > 5 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{job.tech_stack.length - 5}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {job.visa_sponsorship === "true" ? (
                          <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                            Yes
                          </span>
                        ) : job.visa_sponsorship === "false" ? (
                          <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">
                            No
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          View
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentJobs.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-400">
                No jobs found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenTable;
