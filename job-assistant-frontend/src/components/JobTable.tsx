import React from "react";
import { Job } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

interface JobTableProps {
  jobs: Job[];
  onExpand: () => void;
}

const JobTable: React.FC<JobTableProps> = ({ jobs, onExpand }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const { theme } = useTheme();

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const downloadCSV = () => {
    if (jobs.length === 0) return;

    // Create CSV content
    const headers = [
      "Title",
      "Company",
      "Salary",
      "Location",
      "Tech Stack",
      "Visa Sponsorship",
      "Link",
    ];
    const rows = jobs.map((job) => [
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

    // Create download link
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

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${
        theme === "light" ? "glass-table" : "bg-gray-800 border border-gray-700"
      }`}
    >
      {/* Table Header with Actions */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          theme === "light"
            ? "glass-table-header"
            : "bg-gray-750 border-b border-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span
            className={`text-sm font-semibold ${
              theme === "light" ? "text-gray-700" : "text-gray-300"
            }`}
          >
            {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"} Found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
              theme === "light"
                ? "glass-button text-gray-700"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
            title="Download CSV"
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
            Download
          </button>
          <button
            onClick={onExpand}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 flex items-center gap-2 transition-colors"
            title="Expand Table"
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
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            Expand
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-750 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Salary
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Tech Stack
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Visa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {jobs.map((job, index) => (
              <tr key={index} className="hover:bg-gray-750 transition-colors">
                <td className="px-4 py-3 text-sm text-white font-medium">
                  {job.title}
                </td>
                <td className="px-4 py-3 text-sm text-blue-400">
                  {job.company}
                </td>
                <td className="px-4 py-3 text-sm text-green-400 font-semibold">
                  {job.salary}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {job.location}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {job.tech_stack.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {job.tech_stack.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{job.tech_stack.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
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
                <td className="px-4 py-3 text-sm">
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

      {jobs.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-400">No jobs found</div>
      )}
    </div>
  );
};

export default JobTable;
