import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function todayLabel(): string {
  const d = new Date()
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export function TopPage() {
  const navigate = useNavigate()
  const [eventName, setEventName] = useState(todayLabel())
  const [coefficient, setCoefficient] = useState('5')
  const [participants, setParticipants] = useState<string[]>(['', ''])
  const [loading, setLoading] = useState(false)
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const addParticipant = () => setParticipants((p) => [...p, ''])
  const removeParticipant = (i: number) =>
    setParticipants((p) => p.filter((_, idx) => idx !== i))
  const updateParticipant = (i: number, name: string) =>
    setParticipants((p) => p.map((n, idx) => (idx === i ? name : n)))

  const isValid =
    eventName.trim() !== '' &&
    parseFloat(coefficient) > 0 &&
    participants.length >= 2 &&
    participants.every((n) => n.trim() !== '')

  const handleSubmit = async () => {
    if (!isValid || loading) return
    setLoading(true)

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ event_name: eventName.trim(), coefficient: parseFloat(coefficient) })
      .select()
      .single()

    if (sessionError || !session) {
      setLoading(false)
      alert('セッションの作成に失敗しました')
      return
    }

    const { error: participantsError } = await supabase.from('participants').insert(
      participants.map((name) => ({
        session_id: session.id,
        name: name.trim(),
      })),
    )

    if (participantsError) {
      setLoading(false)
      alert('参加者の登録に失敗しました')
      return
    }

    setLoading(false)
    setCreatedSessionId(session.id)
  }

  const handleCopy = () => {
    if (!createdSessionId) return
    const url = `${window.location.origin}/session/${createdSessionId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (createdSessionId) {
    const url = `${window.location.origin}/session/${createdSessionId}`
    return (
      <div className="container">
        <div className="page-header">
          <h1 className="app-title">精算アプリv2</h1>
          <p className="page-subtitle">グループを作成しました</p>
        </div>

        <div className="share-card">
          <p className="share-message">みんなにURLを共有しましょう</p>
          <div className="share-url-box">
            <span className="share-url-text">{url}</span>
            <button
              type="button"
              className={`btn-copy${copied ? ' copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'コピー済' : 'コピー'}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => navigate(`/session/${createdSessionId}`)}
        >
          セッション画面へ →
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="app-title">精算アプリv2</h1>
        <p className="page-subtitle">イベントの設定</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label className="form-label">イベント名</label>
          <input
            className="form-input"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
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
            onChange={(e) => setCoefficient(e.target.value)}
            placeholder="例: 5"
          />
        </div>
      </div>

      <p className="section-header">参加者</p>

      {participants.map((name, i) => (
        <div key={i} className="participant-card">
          <div className="participant-card-header">
            <span className="participant-number">参加者 {i + 1}</span>
            {participants.length > 2 && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeParticipant(i)}
              >
                削除
              </button>
            )}
          </div>
          <div className="form-group last">
            <label className="form-label">名前</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => updateParticipant(i, e.target.value)}
              placeholder="名前を入力"
            />
          </div>
        </div>
      ))}

      <button type="button" className="add-participant-btn" onClick={addParticipant}>
        ＋ 参加者を追加
      </button>

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={!isValid || loading}
        onClick={handleSubmit}
        style={{ marginTop: '8px' }}
      >
        {loading ? '作成中...' : 'セッション作成 →'}
      </button>
    </div>
  )
}
