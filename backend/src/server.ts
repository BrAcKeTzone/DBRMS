// This file sets up and starts the Express server for the Online Management System for the Parent and Teacher Association of JHCSC Dumingag Campus.

import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Increase timeout for large file uploads (2 minutes)
server.timeout = 120000;
