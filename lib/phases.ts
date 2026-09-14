export type Phase = 'focus' | 'short' | 'long'

export type PhaseConfig = {
  label: string
  /** Default duration in minutes, before any user customization. */
  defaultMinutes: number
}

export const PHASE_ORDER: Phase[] = ['focus', 'short', 'long']

export const PHASE_CONFIG: Record<Phase, PhaseConfig> = {
  focus: { label: 'Focus', defaultMinutes: 25 },
  short: { label: 'Short Break', defaultMinutes: 5 },
  long: { label: 'Long Break', defaultMinutes: 15 },
}

export const DEFAULT_DURATIONS: Record<Phase, number> = {
  focus: PHASE_CONFIG.focus.defaultMinutes,
  short: PHASE_CONFIG.short.defaultMinutes,
  long: PHASE_CONFIG.long.defaultMinutes,
}
