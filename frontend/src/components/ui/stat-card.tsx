import { Card, CardContent } from "./card"

interface StatCardProps {
  label: string
  value: string | number
  variant?: "default" | "primary" | "success"
}

export function StatCard(props: StatCardProps) {
  const { label, value, variant = "default" } = props

  const variantStyles = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-success",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-3xl font-bold ${variantStyles[variant]}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
