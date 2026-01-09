import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'

export default function Dropdown({ 
  trigger, 
  items, 
  align = 'left',
  className = '' 
}) {
  const alignmentClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
  }

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <Menu.Button as={Fragment}>
        {trigger}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items 
          className={`
            absolute z-50 mt-2 w-56 rounded-lg bg-white shadow-lg 
            ring-1 ring-black ring-opacity-5 focus:outline-none
            ${alignmentClasses[align]}
          `}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={`
                      w-full text-left px-4 py-2 text-sm
                      ${active ? 'bg-surface-100 text-surface-900' : 'text-surface-700'}
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      ${item.danger ? 'text-red-600' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                      {item.label}
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
