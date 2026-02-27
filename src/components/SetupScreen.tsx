import type { FormEvent } from 'react'

interface Props {
  eventName: string
  coefficient: string
  onChange: (eventName: string, coefficient: string) => void
  onNext: () => void
}

export function SetupScreen({ eventName, coefficient, onChange, onNext }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const isValid = eventName.trim() !== '' && parseFloat(coefficient) > 0

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="app-title">精算アプリ</h1>
        <p className="page-subtitle">イベントの設定</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-group">
            <label className="form-label">イベント名</label>
            <input
              className="form-input"
              type="text"
              value={eventName}
              onChange={(e) => onChange(e.target.value, coefficient)}
              placeholder="例: ポーカー会"
              autoFocus
            />
          </div>
          <div className="form-group last">
            <label className="form-label">係数（円 / チップ）</label>
            <input
              className="form-input"
              type="text"
              inputMode="decimal"
              value={coefficient}
              onChange={(e) => onChange(eventName, e.target.value)}
              placeholder="例: 100"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={!isValid}>
          次へ →
        </button>
      </form>
    </div>
  )
}
