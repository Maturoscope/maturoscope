import React from 'react'

interface SidebarOption {
  key: string
  label: string
  active: boolean
}

interface ToolSettingsSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  options: SidebarOption[]
}

export function ToolSettingsSidebar({ 
  activeSection, 
  onSectionChange, 
  options 
}: ToolSettingsSidebarProps) {
  return (
    <div className="w-64">
      <nav className="space-y-2">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onSectionChange(option.key)}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              activeSection === option.key
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${!option.active ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!option.active}
          >
            {option.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
