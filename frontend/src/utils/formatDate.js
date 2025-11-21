/**
 * Format a date string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return dateObj.toLocaleDateString("en-US", defaultOptions);
};

/**
 * Format a date string or Date object to include time
 * @param {string|Date} date - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return dateObj.toLocaleDateString("en-US", defaultOptions);
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  const timeIntervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of timeIntervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - The date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  return dateObj.toISOString().split("T")[0];
};

/**
 * Format a time string for display (HH:MM AM/PM)
 * @param {string} time - Time string in HH:MM format
 * @param {boolean} use24Hour - Whether to use 24-hour format
 * @returns {string} Formatted time string
 */
export const formatTime = (time, use24Hour = false) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  if (use24Hour) {
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes.padStart(2, "0")} ${ampm}`;
};

/**
 * Get the start and end of a date range
 * @param {string} range - Range type ('today', 'week', 'month', 'year')
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {object} Object with start and end dates
 */
export const getDateRange = (range, referenceDate = new Date()) => {
  const start = new Date(referenceDate);
  const end = new Date(referenceDate);

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "week":
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      break;
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if date is in the past
 */
export const isDateInPast = (date) => {
  if (!date) return false;

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  return dateObj < now;
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if date is in the future
 */
export const isDateInFuture = (date) => {
  if (!date) return false;

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  return dateObj > now;
};

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - The birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  const birthDateObj =
    typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};
