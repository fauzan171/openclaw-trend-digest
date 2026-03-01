import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/__tests__/**', 'src/index.ts'],
    },
    // Timeout per test (10 seconds)
    testTimeout: 10000,
    // Mock environment variables for tests
    env: {
      LOG_LEVEL: 'error',
    },
  },
});
