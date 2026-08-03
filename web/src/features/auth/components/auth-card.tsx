'use client'

import { motion } from 'framer-motion'

import { Logo } from '@/components/common/logo'

interface AuthCardProps {
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
}

export function AuthCard({
  title,
  description,
  footer,
  children,
}: AuthCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-card rounded-2xl border p-6 shadow-sm sm:p-8"
      >
        {children}
      </motion.div>

      {footer && (
        <p className="text-muted-foreground text-center text-sm">{footer}</p>
      )}
    </div>
  )
}
