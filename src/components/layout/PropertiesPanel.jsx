import { useCanvasStore } from '../../stores/canvasStore'
import { Tabs } from '../ui'
import BackgroundEditor from '../controls/BackgroundEditor'
import TextEditor from '../controls/TextEditor'
import ExportPanel from '../controls/ExportPanel'

export default function PropertiesPanel() {
  const { canvases, activeCanvasIndex, activeTextLayerId } = useCanvasStore()
  const currentCanvas = canvases[activeCanvasIndex]
  const textLayers = currentCanvas?.textLayers || []
  const activeTextLayer = textLayers.find(t => t.id === activeTextLayerId)

  const tabs = [
    {
      id: 'text',
      label: '文字',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      ),
      content: <TextEditor />,
    },
    {
      id: 'background',
      label: '背景',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      content: <BackgroundEditor />,
    },
    {
      id: 'export',
      label: '导出',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      content: <ExportPanel />,
    },
  ]

  return (
    <aside className="w-72 bg-white border-l border-surface-200 flex flex-col">
      <div className="p-4 border-b border-surface-200">
        <h2 className="text-sm font-medium text-surface-900">属性面板</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Tabs tabs={tabs} defaultTab="text" />
      </div>
    </aside>
  )
}
