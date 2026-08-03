import { apiRequest } from '@/lib/api'

import type {
  DashboardData,
  IntelligenceData,
  PublicProject,
} from './dashboard.types'

export const dashboardApi = {
  get: () => apiRequest<{ dashboard: DashboardData }>('/dashboard'),
}

export const intelligenceApi = {
  get: () => apiRequest<IntelligenceData>('/intelligence'),
}

export const projectsApi = {
  list: () => apiRequest<PublicProject[]>('/projects'),
}
