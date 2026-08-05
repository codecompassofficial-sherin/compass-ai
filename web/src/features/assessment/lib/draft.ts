import type { AssessmentFormValues } from '@/features/assessment/assessment.validation'

export interface AssessmentDraft {
  stepIndex: number
  values: Partial<AssessmentFormValues>
}

const DRAFT_STORAGE_KEY = 'compass-ai:assessment-draft'

export function readDraft(): AssessmentDraft | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as AssessmentDraft
  } catch {
    return null
  }
}

export function writeDraft(draft: AssessmentDraft): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    return
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.sessionStorage.removeItem(DRAFT_STORAGE_KEY)
}
