const PHASE_NAMES: Record<string, string> = {
  foundation: 'Foundations',
  'core-skills': 'Core Skills',
  projects: 'Project Work',
  'interview-prep': 'Interview Prep',
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getPhaseName(
  phaseKey: string | null | undefined
): string | null {
  if (!phaseKey) {
    return null
  }
  return PHASE_NAMES[phaseKey] ?? capitalize(phaseKey.replace(/-/g, ' '))
}
