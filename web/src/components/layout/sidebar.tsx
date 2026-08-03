'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useSidebarStore } from '@/store/sidebar-store'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SidebarNav } from '@/components/navigation/sidebar-nav'

export function Sidebar() {
  const collapsed = useSidebarStore((state) => state.collapsed)
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed)

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30 hidden flex-col border-r transition-[width] duration-300 ease-in-out lg:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div
        className={cn(
          'border-sidebar-border flex h-14 shrink-0 items-center border-b',
          collapsed ? 'justify-center px-0' : 'justify-between px-3.5'
        )}
      >
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="flex-1">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div
        className={cn(
          'border-sidebar-border mt-auto shrink-0 border-t p-2',
          collapsed && 'p-1.5'
        )}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="w-full"
                  onClick={toggleCollapsed}
                  aria-label="Expand sidebar"
                />
              }
            >
              <PanelLeftOpen className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-2.5"
            onClick={toggleCollapsed}
          >
            <PanelLeftOpen className="size-4" />
            Collapse
          </Button>
        )}
      </div>
    </aside>
  )
}
