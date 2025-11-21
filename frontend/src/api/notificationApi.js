import { fetchClient } from "../utils/fetchClient";

/**
 * IMPORTANT: The backend does NOT have REST API endpoints for notifications.
 * Notifications are sent automatically via email by the backend notification service.
 * This file is kept for potential future expansion or client-side notification management.
 *
 * For now, notifications are handled entirely server-side:
 * - Application submission → emails sent automatically
 * - Application approval → emails sent automatically
 * - Application rejection → emails sent automatically
 * - Demo scheduling → emails sent automatically
 * - Results → emails sent automatically
 */

// Note: These functions are placeholders and will return empty data
// since there are no actual backend endpoints for these operations

const API_BASE = "/api/notifications";

export const notificationApi = {
  // Placeholder: Backend sends emails automatically, no API needed
  getUserNotifications: async () => {
    console.warn(
      "Notifications are sent via email by backend, no API endpoint available"
    );
    return { data: [] };
  },

  // Placeholder
  markAsRead: async (notificationId) => {
    console.warn(
      "Notifications are sent via email by backend, no API endpoint available"
    );
    return { data: null };
  },

  // Placeholder
  markAllAsRead: async () => {
    console.warn(
      "Notifications are sent via email by backend, no API endpoint available"
    );
    return { data: null };
  },

  // Placeholder
  deleteNotification: async (notificationId) => {
    console.warn(
      "Notifications are sent via email by backend, no API endpoint available"
    );
    return { data: null };
  },

  // Placeholder
  getUnreadCount: async () => {
    console.warn(
      "Notifications are sent via email by backend, no API endpoint available"
    );
    return { data: { count: 0 } };
  },
};
