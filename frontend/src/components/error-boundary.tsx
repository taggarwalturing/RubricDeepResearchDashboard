import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="text-xs bg-muted p-3 rounded-md">
                  <summary className="cursor-pointer font-medium mb-2">Error details</summary>
                  <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Reload Page
              </button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
