import type { Participant } from '../types'
import { calculateResults } from '../logic/calculation'

interface Props {
  eventName: string
  coefficient: number
  participants: Participant[]
  onBack: () => void
}

export function ResultScreen({ eventName, coefficient, participants, onBack }: Props) {
  const { results, settlements, hasFractionAdjustment } = calculateResults(
    participants,
    coefficient,
  )

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="app-title">{eventName}</h1>
        <p className="page-subtitle">精算結果</p>
      </div>

      {hasFractionAdjustment && (
        <div className="fraction-badge">⚠ 端数調整あり</div>
      )}

      <p className="section-header">損益一覧</p>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>名前</th>
              <th>購入</th>
              <th>最終</th>
              <th>チップ損益</th>
              <th>場所代</th>
              <th>精算額</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.buyChips.toLocaleString()}</td>
                <td>{r.finalChips.toLocaleString()}</td>
                <td className={r.chipPnL >= 0 ? 'amount-positive' : 'amount-negative'}>
                  {r.chipPnL >= 0 ? '+' : ''}
                  {Math.round(r.chipPnL).toLocaleString()}円
                </td>
                <td>¥{r.venue.toLocaleString()}</td>
                <td className={r.finalPnL >= 0 ? 'amount-positive' : 'amount-negative'}>
                  {r.finalPnL >= 0 ? '+' : ''}
                  {r.finalPnL.toLocaleString()}円
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="section-header">精算方法</p>
      <div className="settlement-list">
        {settlements.length === 0 ? (
          <p className="empty-state">精算は不要です</p>
        ) : (
          settlements.map((s, i) => (
            <div key={i} className="settlement-item">
              <span className="settlement-from">{s.from}</span>
              <span className="settlement-arrow">→</span>
              <span className="settlement-to">{s.to}</span>
              <span className="settlement-amount">¥{s.amount.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>

      <div className="action-bar">
        <div className="action-bar-inner">
          <button type="button" className="btn btn-secondary btn-block" onClick={onBack}>
            ← 入力画面に戻る
          </button>
        </div>
      </div>
    </div>
  )
}
