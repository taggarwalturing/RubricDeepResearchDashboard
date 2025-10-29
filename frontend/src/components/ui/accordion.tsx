import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function Accordion(props: AccordionProps) {
  const { title, children, defaultOpen = false } = props
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t p-4">
          {children}
        </div>
      )}
    </div>
  )
}
