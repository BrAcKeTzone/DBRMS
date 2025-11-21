import React from "react";

const StatusTracker = ({
  currentStatus,
  stages = ["Submitted", "Demo Scheduled", "Completed"],
  timestamps = {},
  className = "",
}) => {
  const getStageIndex = (status) => {
    const statusMapping = {
      pending: 0,
      approved: 1,
      completed: 2,
      rejected: -1, // Special case for rejected
    };

    return statusMapping[status?.toLowerCase()] || 0;
  };

  const currentIndex = getStageIndex(currentStatus);
  const isRejected = currentStatus?.toLowerCase() === "rejected";

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;

    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isRejected) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="font-medium">Application Rejected</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {stages.map((stage, index) => (
            <div key={stage} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    index <= currentIndex
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-400 border-gray-300"
                  }`}
                >
                  {index < currentIndex ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Connecting Line */}
                {index < stages.length - 1 && (
                  <div
                    className={`absolute top-5 left-10 w-full h-0.5 ${
                      index < currentIndex ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    style={{ width: "calc(100vw / 4 - 2.5rem)" }}
                  />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-medium ${
                    index <= currentIndex ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {stage}
                </p>
                {timestamps[stage] && (
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(timestamps[stage])}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage} className="flex items-center space-x-3">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                  index <= currentIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index < currentIndex ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    index <= currentIndex ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {stage}
                </p>
                {timestamps[stage] && (
                  <p className="text-xs text-gray-400">
                    {formatTimestamp(timestamps[stage])}
                  </p>
                )}
              </div>

              {/* Status Indicator */}
              {index === currentIndex && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Current
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentIndex + 1) / stages.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatusTracker;
