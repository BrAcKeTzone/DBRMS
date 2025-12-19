import { beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";

beforeAll(() => {
  // Set up a test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  // Run migrations to ensure the test database is up to date
  execSync("npx prisma migrate deploy");
});

afterAll(() => {
  // Clean up the test database
  execSync("npx prisma migrate reset --force");
});
