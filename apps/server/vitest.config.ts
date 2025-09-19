import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['/tests/setup.ts'],
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'src/**/*.d.ts', 'src/**/*.config.{js,ts}', 'src/**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
