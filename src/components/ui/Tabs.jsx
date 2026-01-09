import { useState } from 'react'

export default function Tabs({ 
  tabs, 
  defaultTab,
  onChange,
  className = '' 
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const activeTabContent = tabs.find(t => t.id === activeTab)?.content

  return (
    <div className={className}>
      <div className="flex border-b border-surface-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              px-4 py-2.5 text-sm font-medium transition-colors
              border-b-2 -mb-px
              ${activeTab === tab.id 
                ? 'text-primary-600 border-primary-600' 
                : 'text-surface-500 border-transparent hover:text-surface-700 hover:border-surface-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
      <div className="pt-4">
        {activeTabContent}
      </div>
    </div>
  )
}

export function TabPanel({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
