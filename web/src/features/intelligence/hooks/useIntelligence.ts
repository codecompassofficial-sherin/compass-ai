'use client'

import { useApiQuery } from '@/lib/use-api-query'

import { intelligenceApi } from '../api/intelligence.api'
import { INTELLIGENCE_QUERY_KEY } from '../constants/intelligence.constants'
import type { IntelligenceData } from '../types/intelligence.types'

export function useIntelligence() {
  return useApiQuery<IntelligenceData>(
    INTELLIGENCE_QUERY_KEY,
    intelligenceApi.get
  )
}
