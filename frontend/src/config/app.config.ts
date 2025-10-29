interface AppConfig {
  apiBaseUrl: string
  apiTimeout: number
  appName: string
  isDevelopment: boolean
  isProduction: boolean
  useMockApi: boolean
}

function getConfig(): AppConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
  const apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT) || 30000
  const appName = import.meta.env.VITE_APP_NAME || "Amazon Review Dashboard"
  const isDevelopment = import.meta.env.DEV
  const isProduction = import.meta.env.PROD
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true"

  return {
    apiBaseUrl,
    apiTimeout,
    appName,
    isDevelopment,
    isProduction,
    useMockApi,
  }
}

export const config = getConfig()
