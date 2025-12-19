import { beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";

beforeAll(() => {
  // Ensure TEST_DATABASE_URL is set for tests
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Set it to a valid database connection string before running tests. Example: TEST_DATABASE_URL="mysql://USER:PASS@HOST:PORT/TEST_DB"'
    );
  }

  // Set up a test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  // Run migrations to ensure the test database is up to date
  execSync("npx prisma migrate deploy");
});

afterAll(() => {
  // Clean up the test database
  execSync("npx prisma migrate reset --force");
});
