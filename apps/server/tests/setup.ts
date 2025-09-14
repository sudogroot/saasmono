process.env.NODE_ENV = 'test';

import { drizzle } from "drizzle-orm/node-postgres";
import { beforeAll, afterAll } from "vitest";
import { spawn } from "child_process";
import { promisify } from "util";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://postgres:password@localhost:5004/manarah_test";

export const testDb = drizzle(TEST_DATABASE_URL);

const execCommand = (command: string, args: string[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
};

beforeAll(async () => {
  console.log("Setting up test database:", TEST_DATABASE_URL);

  try {
    // Run drizzle push to sync schema
    await execCommand('npx', ['drizzle-kit', 'push']);
    console.log("Database schema synchronized");
  } catch (error) {
    console.error("Failed to sync database schema:", error);
    throw error;
  }
});

afterAll(async () => {
  console.log("Test database cleanup completed");
});
