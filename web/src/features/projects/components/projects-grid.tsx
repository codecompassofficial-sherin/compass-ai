'use client'

import { motion } from 'framer-motion'

import type { PublicProject } from '../types/projects.types'
import { ProjectCard } from './project-card'

interface ProjectsGridProps {
  projects: PublicProject[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ProjectsGrid({
  projects,
  selectedId,
  onSelect,
}: ProjectsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
        >
          <ProjectCard
            project={project}
            selected={selectedId === project.id}
            onSelect={onSelect}
          />
        </motion.div>
      ))}
    </div>
  )
}
