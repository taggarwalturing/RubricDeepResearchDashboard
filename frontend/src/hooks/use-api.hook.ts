import { useEffect, useReducer, useRef } from "react"
import type { ApiResponse } from "../types/api.type"

interface UseApiConfig<T> {
  fetchFn: (signal?: AbortSignal) => Promise<T>
  enabled?: boolean
}

type State<T> = {
  data: T | null
  error: { detail: string } | null
  isLoading: boolean
}

type Action<T> =
  | { type: "FETCH_INIT" }
  | { type: "FETCH_SUCCESS"; payload: T }
  | { type: "FETCH_FAILURE"; payload: string }

function createReducer<T>() {
  return function reducer(state: State<T>, action: Action<T>): State<T> {
    switch (action.type) {
      case "FETCH_INIT":
        return { ...state, isLoading: true, error: null }
      case "FETCH_SUCCESS":
        return { data: action.payload, isLoading: false, error: null }
      case "FETCH_FAILURE":
        return { ...state, isLoading: false, error: { detail: action.payload } }
      default:
        return state
    }
  }
}

const initialState = {
  data: null,
  error: null,
  isLoading: false,
}

/**
 * Custom hook for API data fetching with proper cleanup and error handling
 *
 * @template T - The type of data returned by the API
 * @param config - Configuration object containing the fetch function and options
 * @returns ApiResponse object with data, error, and loading state
 *
 * @example
 * const { data, error, isLoading } = useApi({
 *   fetchFn: getOverallStatistics,
 *   enabled: true, // optional, defaults to true
 * })
 */
export function useApi<T>(config: UseApiConfig<T>): ApiResponse<T> {
  const { fetchFn, enabled = true } = config

  const [state, dispatch] = useReducer(createReducer<T>(), initialState as State<T>)

  // Store fetchFn in ref to avoid re-running effect when it changes
  const fetchFnRef = useRef(fetchFn)

  // Update ref when fetchFn changes (but don't trigger effect)
  useEffect(() => {
    fetchFnRef.current = fetchFn
  }, [fetchFn])

  useEffect(() => {
    // Skip if disabled
    if (!enabled) {
      return
    }

    let didCancel = false
    const abortController = new AbortController()

    async function fetchData() {
      dispatch({ type: "FETCH_INIT" })

      try {
        const result = await fetchFnRef.current(abortController.signal)

        // Only update if not cancelled
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result })
        }
      } catch (err) {
        // Only update if not cancelled and not aborted
        if (!didCancel && !abortController.signal.aborted) {
          const message = err instanceof Error ? err.message : "An unknown error occurred"
          dispatch({ type: "FETCH_FAILURE", payload: message })
        }
      }
    }

    fetchData()

    // Cleanup function
    return () => {
      didCancel = true
      abortController.abort()
    }
  }, [enabled]) // Only re-run when enabled changes

  return state
}
