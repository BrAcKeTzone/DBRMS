// This file sets up and starts the Express server for the Online Management System for the Parent and Teacher Association of JHCSC Dumingag Campus.

import app from "./app";
import dotenv from "dotenv";
import * as meetingService from "./api/meetings/meetings.service";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Run cleanup for old attendance attempts when server starts
  // and then every 24 hours
  cleanupAttendanceAttempts();
  setInterval(cleanupAttendanceAttempts, 24 * 60 * 60 * 1000); // Run every 24 hours
});

// Increase timeout for large file uploads (2 minutes)
server.timeout = 120000;

/**
 * Cleanup function for old attendance attempts
 */
async function cleanupAttendanceAttempts() {
  try {
    const result = await meetingService.cleanupOldAttendanceAttempts();
    console.log(
      `[Cleanup Task] ${result.message} at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error(
      `[Cleanup Task Error] Failed to cleanup attendance attempts:`,
      error
    );
  }
}
