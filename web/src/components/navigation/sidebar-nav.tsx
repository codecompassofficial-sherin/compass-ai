'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { appNavigation } from '@/lib/navigation'
import type { NavItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

  const content = (
    <>
      <item.icon className="size-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate">{item.title}</span>
          {item.disabled && (
            <Badge variant="outline" className="ml-auto px-1.5 text-[10px]">
              Soon
            </Badge>
          )}
        </>
      )}
    </>
  )

  const className = cn(
    'relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
    collapsed && 'justify-center px-0',
    item.disabled
      ? 'cursor-not-allowed text-muted-foreground/50'
      : active
        ? 'bg-accent font-medium text-accent-foreground'
        : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'
  )

  if (item.disabled) {
    return (
      <div className={className} aria-disabled="true">
        {content}
        {collapsed && (
          <span className="bg-muted-foreground/40 absolute top-1.5 right-1.5 size-1.5 rounded-full" />
        )}
      </div>
    )
  }

  const link = (
    <Link
      href={item.href}
      className={className}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? item.title : undefined}
      onClick={onNavigate}
    >
      {content}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: SidebarNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-col gap-6 overflow-y-auto px-3 py-2"
    >
      {appNavigation.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          {!collapsed && (
            <p className="text-muted-foreground/70 mb-1 px-2.5 text-xs font-medium tracking-wide uppercase">
              {section.title}
            </p>
          )}
          {section.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}
