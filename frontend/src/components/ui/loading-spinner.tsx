import { cn } from "../../lib/utils"
import { APP_CONTENT, SPINNER_SIZES } from "../../constants/app.constants"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  [SPINNER_SIZES.small]: "h-4 w-4 border-2",
  [SPINNER_SIZES.medium]: "h-8 w-8 border-2",
  [SPINNER_SIZES.large]: "h-12 w-12 border-3",
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
  const { className, size = SPINNER_SIZES.medium } = props

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={APP_CONTENT.loading.ariaLabel}
    >
      <span className="sr-only">{APP_CONTENT.loading.text}</span>
    </div>
  )
}
