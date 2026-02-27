export type Screen = 'setup' | 'participants' | 'result'

export interface Participant {
  id: string
  name: string
  buyChips: string
  finalChips: string
  venue: string
}

export interface AppState {
  screen: Screen
  eventName: string
  coefficient: string
  participants: Participant[]
}

export interface ParticipantResult {
  id: string
  name: string
  buyChips: number
  finalChips: number
  venue: number
  chipPnL: number
  finalPnL: number
}

export interface Settlement {
  from: string
  to: string
  amount: number
}

export interface CalculationResult {
  results: ParticipantResult[]
  settlements: Settlement[]
  hasFractionAdjustment: boolean
}
