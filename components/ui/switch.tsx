"use client"

import * as React from "react"

export interface SwitchProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ id, checked = false, onCheckedChange, disabled = false, className = "" }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1
          focus-visible:ring-[#B3736B] disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-[#B3736B]' : 'bg-gray-200'}
          ${className}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
