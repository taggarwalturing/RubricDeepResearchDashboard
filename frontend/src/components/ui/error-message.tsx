import { AlertCircle } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "./card"
import { APP_CONTENT } from "../../constants/app.constants"

interface ErrorMessageProps {
  title?: string
  message: string
}

export function ErrorMessage(props: ErrorMessageProps) {
  const { title = APP_CONTENT.error.defaultTitle, message } = props

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-destructive/80">
          {message}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
