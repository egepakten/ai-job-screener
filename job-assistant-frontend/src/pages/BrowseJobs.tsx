import React, { useState, useEffect } from "react";
import { jobsAPI, Job } from "../services/api";
import { useChat } from "../contexts/ChatContext";

const BrowseJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiFilteredJobs, setAiFilteredJobs] = useState<Job[] | null>(null);
  const [aiQuery, setAiQuery] = useState<string>("");
  const { setOnDataTransform, openChat } = useChat();
  const jobsPerPage = 10;

  // Setup data transform callback for AI chat
  useEffect(() => {
    setOnDataTransform((data: any) => {
      if (data && data.jobs) {
        setAiFilteredJobs(data.jobs);
        setAiQuery(data.query || "");
        setCurrentPage(1);
      }
    });

    // Cleanup
    return () => {
      setOnDataTransform(undefined);
    };
  }, [setOnDataTransform]);

  // Fetch jobs when page or search changes
  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchTerm]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = searchTerm
        ? await jobsAPI.searchJobs(searchTerm, currentPage, jobsPerPage)
        : await jobsAPI.browseJobs(currentPage, jobsPerPage);

      setJobs(data.results);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    setAiFilteredJobs(null); // Clear AI filters
    setAiQuery("");
  };

  const clearAiFilter = () => {
    setAiFilteredJobs(null);
    setAiQuery("");
    fetchJobs();
  };

  // Determine which jobs to display
  const displayJobs = aiFilteredJobs || jobs;
  const displayTotal = aiFilteredJobs ? aiFilteredJobs.length : total;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Browse All Jobs</h1>
          <button
            onClick={openChat}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Ask AI to Filter/Sort
          </button>
        </div>

        {aiQuery && (
          <div className="mb-4 p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-blue-400 font-semibold">
                AI Filter Active:
              </span>
              <span className="ml-2 text-white">"{aiQuery}"</span>
            </div>
            <button
              onClick={clearAiFilter}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Clear Filter
            </button>
          </div>
        )}

        <p className="text-gray-400">
          Found {displayTotal} jobs{" "}
          {aiFilteredJobs
            ? "(AI filtered)"
            : `• Page ${currentPage} of ${totalPages}`}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by keyword (e.g., python, engineer, AWS)..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Jobs List */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading jobs...</p>
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No jobs found</p>
            {searchTerm && (
              <p className="text-gray-500 mt-2">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayJobs.map((job, index) => (
              <div
                key={`${job.link}-${index}`}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {job.title}
                    </h3>
                    <p className="text-blue-400 font-medium">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{job.salary}</p>
                    <p className="text-gray-500 text-sm">{job.location}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-2">
                  {job.description}
                </p>

                {job.tech_stack && job.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tech_stack.slice(0, 8).map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-700 text-sm rounded-full text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {job.tech_stack.length > 8 && (
                      <span className="px-3 py-1 text-sm text-gray-500">
                        +{job.tech_stack.length - 8} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {job.visa_sponsorship !== "unknown" && (
                      <span
                        className={`px-3 py-1 rounded-full ${
                          job.visa_sponsorship === "true"
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        Visa: {job.visa_sponsorship === "true" ? "Yes" : "No"}
                      </span>
                    )}
                  </div>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold"
                  >
                    View Job →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!aiFilteredJobs && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 border border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseJobs;
