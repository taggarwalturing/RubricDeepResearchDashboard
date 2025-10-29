import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import App from "./App"
import { LoadingSpinner } from "./components/ui/loading-spinner"
import { ErrorBoundary } from "./components/error-boundary"
import { SPINNER_SIZES } from "./constants/app.constants"

const Dashboard = lazy(() => import("./pages/dashboard"))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size={SPINNER_SIZES.large} />
    </div>
  )
}

export function Router() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
