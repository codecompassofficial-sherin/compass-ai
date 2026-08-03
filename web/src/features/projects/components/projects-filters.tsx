'use client'

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import {
  PROJECT_STATUS_FILTERS,
  PROJECT_STATUS_FILTER_META,
  type ProjectStatusFilter,
} from '../constants/projects.constants'

interface ProjectsFiltersProps {
  filter: ProjectStatusFilter
  onFilterChange: (filter: ProjectStatusFilter) => void
  search: string
  onSearchChange: (search: string) => void
  counts: Record<ProjectStatusFilter, number>
}

export function ProjectsFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  counts,
}: ProjectsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1.5" role="tablist">
        {PROJECT_STATUS_FILTERS.map((option) => {
          const active = filter === option
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(option)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[0.8rem] font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {PROJECT_STATUS_FILTER_META[option].label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs tabular-nums',
                  active
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {counts[option]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="relative sm:w-64">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects…"
          className="pl-8"
          aria-label="Search projects"
        />
      </div>
    </div>
  )
}
