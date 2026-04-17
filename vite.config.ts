import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

function resolveBasePath(): string {
  const explicitBase = process.env.VITE_BASE_PATH
  if (explicitBase && explicitBase.trim().length > 0) {
    return explicitBase
  }

  if (process.env.GITHUB_ACTIONS === 'true') {
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
    if (repo.endsWith('.github.io')) {
      return '/'
    }
    if (repo.length > 0) {
      return `/${repo}/`
    }
  }

  return '/'
}

export default defineConfig({
  plugins: [react()],
  base: resolveBasePath(),
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
