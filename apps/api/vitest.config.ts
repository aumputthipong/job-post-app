import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/setup.ts"],
    // Every file shares one emulator database and wipes it between tests,
    // so files must not run at the same time.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
