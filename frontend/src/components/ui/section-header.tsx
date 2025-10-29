import { TYPOGRAPHY } from "../../constants/app.constants"

interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="space-y-1">
      <h3 className={TYPOGRAPHY.heading.section}>{title}</h3>
      {subtitle && (
        <p className={TYPOGRAPHY.subtitle}>{subtitle}</p>
      )}
    </div>
  )
}

