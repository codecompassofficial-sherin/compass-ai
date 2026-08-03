'use client'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MobileNav } from '@/components/navigation/mobile-nav'
import { ThemeToggle } from '@/components/navigation/theme-toggle'
import { UserMenu } from '@/components/navigation/user-menu'

export function Header() {
  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <MobileNav />
      <div className="hidden sm:block">
        <Breadcrumbs />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
