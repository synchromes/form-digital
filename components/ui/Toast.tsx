'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, message: string, duration: number = 5000) => {
      const id = Math.random().toString(36).substring(7)
      const toast: Toast = { id, type, message, duration }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback((message: string, duration?: number) => {
    showToast('success', message, duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast('error', message, duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast('warning', message, duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast('info', message, duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-500',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'text-green-800',
          iconBg: 'bg-green-100',
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-500',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: 'text-red-800',
          iconBg: 'bg-red-100',
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-500',
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-100',
        }
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-500',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-800',
          iconBg: 'bg-blue-100',
        }
    }
  }

  const styles = getToastStyles()

  return (
    <div
      className={`
        ${styles.bg}
        border-l-4 rounded-lg shadow-lg p-4 pr-8
        min-w-[320px] max-w-md
        animate-in slide-in-from-right duration-300
        pointer-events-auto
        relative
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.iconBg} p-1.5 rounded-lg flex-shrink-0`}>
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${styles.text} text-sm font-medium leading-relaxed break-words`}>
            {toast.message}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
