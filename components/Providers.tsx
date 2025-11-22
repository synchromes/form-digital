'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ToastProvider } from './ui/Toast'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  )
}
