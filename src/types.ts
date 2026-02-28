export interface DbSession {
  id: string
  event_name: string
  coefficient: number
  created_at: string
}

export interface DbParticipant {
  id: string
  session_id: string
  name: string
  buy_chips: number | null
  final_chips: number | null
  venue_fee: number
  created_at: string
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
