import type { DbParticipant, ParticipantResult, Settlement, CalculationResult } from '../types'

export function checkCalculationReady(participants: DbParticipant[]): {
  ready: boolean
  reasons: string[]
} {
  const reasons: string[] = []

  const unentered = participants.filter((p) => p.buy_chips === null || p.final_chips === null)
  if (unentered.length > 0) {
    unentered.forEach((p) => reasons.push(`${p.name}が入力していません`))
  } else {
    const totalBuy = participants.reduce((sum, p) => sum + (p.buy_chips ?? 0), 0)
    const totalFinal = participants.reduce((sum, p) => sum + (p.final_chips ?? 0), 0)
    if (totalBuy !== totalFinal) {
      reasons.push(
        `購入チップ${totalBuy.toLocaleString()}と最終チップ${totalFinal.toLocaleString()}が一致していません`,
      )
    }
  }

  return { ready: reasons.length === 0, reasons }
}

export function calculateResults(
  participants: DbParticipant[],
  coefficient: number,
): CalculationResult {
  const n = participants.length
  if (n === 0) return { results: [], settlements: [], hasFractionAdjustment: false }

  const totalVenue = participants.reduce((sum, p) => sum + p.venue_fee, 0)
  const avgVenue = totalVenue / n

  const rawResults = participants.map((p) => {
    const buyChips = p.buy_chips ?? 0
    const finalChips = p.final_chips ?? 0
    const venue = p.venue_fee
    const chipPnL = (finalChips - buyChips) * coefficient
    const rawFinalPnL = chipPnL + (venue - avgVenue)
    return { id: p.id, name: p.name, buyChips, finalChips, venue, chipPnL, rawFinalPnL }
  })

  const roundedPnLs = rawResults.map((r) => Math.round(r.rawFinalPnL))
  const sum = roundedPnLs.reduce((a, b) => a + b, 0)

  const hasFractionAdjustment = sum !== 0
  if (hasFractionAdjustment) {
    let worstIdx = 0
    for (let i = 1; i < rawResults.length; i++) {
      if (rawResults[i].rawFinalPnL < rawResults[worstIdx].rawFinalPnL) {
        worstIdx = i
      }
    }
    roundedPnLs[worstIdx] -= sum
  }

  const results: ParticipantResult[] = rawResults.map((r, i) => ({
    id: r.id,
    name: r.name,
    buyChips: r.buyChips,
    finalChips: r.finalChips,
    venue: r.venue,
    chipPnL: r.chipPnL,
    finalPnL: roundedPnLs[i],
  }))

  const settlements = minimizeSettlements(
    results.map((r) => ({ name: r.name, balance: r.finalPnL })),
  )

  return { results, settlements, hasFractionAdjustment }
}

function minimizeSettlements(balances: { name: string; balance: number }[]): Settlement[] {
  const arr = balances.map((b) => ({ ...b }))
  const settlements: Settlement[] = []

  arr.sort((a, b) => a.balance - b.balance)

  let left = 0
  let right = arr.length - 1

  while (left < right) {
    const amount = Math.min(-arr[left].balance, arr[right].balance)

    if (amount > 0) {
      settlements.push({ from: arr[left].name, to: arr[right].name, amount })
    }

    arr[left].balance += amount
    arr[right].balance -= amount

    if (arr[left].balance >= 0) left++
    if (arr[right].balance <= 0) right--
  }

  return settlements
}
