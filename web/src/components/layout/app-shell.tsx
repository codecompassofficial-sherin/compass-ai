'use client'

import { motion } from 'framer-motion'

import { useSidebarStore } from '@/store/sidebar-store'
import { cn } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSidebarStore((state) => state.collapsed)

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-dvh flex-col transition-[padding] duration-300 ease-in-out lg:pl-16',
          !collapsed && 'lg:pl-60'
        )}
      >
        <Header />
        <motion.main
          id="main"
          tabIndex={-1}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex flex-1 flex-col"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
