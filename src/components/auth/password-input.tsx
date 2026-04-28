'use client'

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className={className}
        style={{ ...props.style, paddingRight: '48px' }}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          color: 'rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
          zIndex: 10
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--teal)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
      >
        {showPassword ? (
          <EyeOff size={18} strokeWidth={2.5} />
        ) : (
          <Eye size={18} strokeWidth={2.5} />
        )}
      </button>
    </div>
  )
}
