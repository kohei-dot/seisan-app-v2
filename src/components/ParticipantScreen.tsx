import type { Participant } from '../types'
import { parseNum } from '../logic/calculation'

interface Props {
  eventName: string
  participants: Participant[]
  onUpdate: (id: string, updates: Partial<Participant>) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onNext: () => void
}

export function ParticipantScreen({
  eventName,
  participants,
  onUpdate,
  onAdd,
  onRemove,
  onNext,
}: Props) {
  const totalBuy = participants.reduce((sum, p) => sum + parseNum(p.buyChips), 0)
  const totalFinal = participants.reduce((sum, p) => sum + parseNum(p.finalChips), 0)

  const hasAnyChipInput = participants.some((p) => p.buyChips !== '' || p.finalChips !== '')
  const chipMismatch = hasAnyChipInput && totalBuy !== totalFinal

  const allNamed = participants.length >= 1 && participants.every((p) => p.name.trim() !== '')
  const canProceed = allNamed && !chipMismatch && participants.length >= 2

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="app-title">{eventName}</h1>
        <p className="page-subtitle">参加者を入力してください</p>
      </div>

      {participants.map((p, index) => (
        <div key={p.id} className="participant-card">
          <div className="participant-card-header">
            <span className="participant-number">参加者 {index + 1}</span>
            {participants.length > 1 && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => onRemove(p.id)}
              >
                削除
              </button>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">名前</label>
            <input
              className="form-input"
              type="text"
              value={p.name}
              onChange={(e) => onUpdate(p.id, { name: e.target.value })}
              placeholder="名前を入力"
            />
          </div>

          <div className="input-row">
            <div className="form-group">
              <label className="form-label">購入チップ</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                value={p.buyChips}
                onChange={(e) => onUpdate(p.id, { buyChips: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">最終チップ</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                value={p.finalChips}
                onChange={(e) => onUpdate(p.id, { finalChips: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group last">
            <label className="form-label">場所代（円）</label>
            <input
              className="form-input"
              type="text"
              inputMode="numeric"
              value={p.venue}
              onChange={(e) => onUpdate(p.id, { venue: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>
      ))}

      <button type="button" className="add-participant-btn" onClick={onAdd}>
        ＋ 参加者を追加
      </button>

      {chipMismatch && (
        <div className="error-banner">
          <span>
            購入チップ合計（{totalBuy.toLocaleString()}）と最終チップ合計（
            {totalFinal.toLocaleString()}）が一致しません
          </span>
        </div>
      )}

      <div className="action-bar">
        <div className="action-bar-inner">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={onNext}
            disabled={!canProceed}
          >
            結果を見る →
          </button>
        </div>
      </div>
    </div>
  )
}
