import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"

interface Tab {
  label: string
  path: string
}

interface TabsProps {
  tabs: Tab[]
}

export function Tabs(props: TabsProps) {
  const { tabs } = props
  const location = useLocation()

  return (
    <div className="border-b">
      <nav className="flex gap-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
