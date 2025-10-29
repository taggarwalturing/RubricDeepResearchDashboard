import { Card, CardContent } from "../ui/card"
import { TYPOGRAPHY, ICON_SIZES, LAYOUT } from "../../constants/app.constants"
import { cn } from "../../lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  description?: string
  icon: React.ReactNode
  variant: "primary" | "success" | "destructive" | "warning"
  colorClass?: string
}

const VARIANT_STYLES = {
  primary: {
    border: "border-l-primary",
    text: "",
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  success: {
    border: "border-l-success",
    text: "text-success",
    bg: "bg-success/10",
    iconColor: "text-success",
  },
  destructive: {
    border: "border-l-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  warning: {
    border: "border-l-warning",
    text: "text-warning",
    bg: "bg-warning/10",
    iconColor: "text-warning",
  },
} as const

export function MetricCard({ label, value, description, icon, variant, colorClass }: MetricCardProps) {
  const styles = VARIANT_STYLES[variant]
  const textColor = colorClass || styles.text

  return (
    <Card className={cn("border-l-4", styles.border)}>
      <CardContent className={LAYOUT.padding.card}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={TYPOGRAPHY.heading.card}>{label}</p>
            <p className={cn(TYPOGRAPHY.value.primary, textColor)}>{value}</p>
            {description && (
              <p className={TYPOGRAPHY.value.secondary}>{description}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", styles.bg)}>
            <div className={cn(ICON_SIZES.metric, styles.iconColor)}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

