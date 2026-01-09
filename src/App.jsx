import Sidebar from './components/layout/Sidebar'
import CanvasArea from './components/layout/CanvasArea'
import PropertiesPanel from './components/layout/PropertiesPanel'
import { ToastProvider } from './components/ui/Toast'

function App() {
  return (
    <ToastProvider>
      <div className="h-screen w-screen flex bg-surface-100">
        <Sidebar />
        <CanvasArea />
        <PropertiesPanel />
      </div>
    </ToastProvider>
  )
}

export default App
