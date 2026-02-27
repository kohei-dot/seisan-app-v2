import type { Participant, ParticipantResult, Settlement, CalculationResult } from '../types'

export function parseNum(s: string): number {
  const n = Number(s)
  return isNaN(n) ? 0 : n
}

export function calculateResults(
  participants: Participant[],
  coefficient: number,
): CalculationResult {
  const n = participants.length
  if (n === 0) return { results: [], settlements: [], hasFractionAdjustment: false }

  const totalVenue = participants.reduce((sum, p) => sum + parseNum(p.venue), 0)
  const avgVenue = totalVenue / n

  // 各参加者の未丸め損益を計算
  const rawResults = participants.map((p) => {
    const buyChips = parseNum(p.buyChips)
    const finalChips = parseNum(p.finalChips)
    const venue = parseNum(p.venue)
    const chipPnL = (finalChips - buyChips) * coefficient
    const rawFinalPnL = chipPnL + (venue - avgVenue)
    return { id: p.id, name: p.name, buyChips, finalChips, venue, chipPnL, rawFinalPnL }
  })

  // 四捨五入
  const roundedPnLs = rawResults.map((r) => Math.round(r.rawFinalPnL))
  const sum = roundedPnLs.reduce((a, b) => a + b, 0)

  // 端数調整: 合計が0にならない場合、最も損している人を調整
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

/**
 * 最小送金数で精算を最適化する。
 * 正のbalance = 受け取り側、負のbalance = 支払い側。
 */
function minimizeSettlements(balances: { name: string; balance: number }[]): Settlement[] {
  const arr = balances.map((b) => ({ ...b }))
  const settlements: Settlement[] = []

  // 昇順ソート（最も負の人が先頭、最も正の人が末尾）
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
