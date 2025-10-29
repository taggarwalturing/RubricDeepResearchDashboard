import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Menu } from "lucide-react"
import { Sidebar } from "./components/ui/sidebar"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile menu button */}
        <div className="lg:hidden border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-2"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
            <span className="font-medium">Menu</span>
          </button>
        </div>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default App
