import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { DbSession, DbParticipant } from '../types'
import { calculateResults, checkCalculationReady } from '../logic/calculation'
import { InputModal } from '../components/InputModal'

export function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<DbSession | null>(null)
  const [participants, setParticipants] = useState<DbParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [modalParticipant, setModalParticipant] = useState<DbParticipant | null>(null)
  const [showAddInput, setShowAddInput] = useState(false)
  const [addingName, setAddingName] = useState('')

  const fetchParticipants = useCallback(() => {
    if (!id) return
    supabase
      .from('participants')
      .select()
      .eq('session_id', id)
      .order('created_at')
      .then(({ data }) => {
        setParticipants(data ?? [])
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!id) return

    supabase
      .from('sessions')
      .select()
      .eq('id', id)
      .single()
      .then(({ data }) => setSession(data))

    fetchParticipants()

    const channel = supabase
      .channel(`session:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${id}` },
        fetchParticipants,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const handleDelete = async (participant: DbParticipant) => {
    if (!confirm(`「${participant.name}」を削除しますか？`)) return
    await supabase.from('participants').delete().eq('id', participant.id)
  }

  const handleAddParticipant = async () => {
    if (!addingName.trim() || !id) return
    await supabase.from('participants').insert({ session_id: id, name: addingName.trim() })
    setAddingName('')
    setShowAddInput(false)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="page-header">
          <p className="page-subtitle">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container">
        <div className="page-header">
          <p className="page-subtitle">セッションが見つかりません</p>
        </div>
      </div>
    )
  }

  const { ready, reasons } = checkCalculationReady(participants)
  const calcResult = ready ? calculateResults(participants, session.coefficient) : null

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="app-title">{session.event_name}</h1>
        <p className="page-subtitle">係数: {session.coefficient}円 / chip</p>
      </div>

      <p className="section-header">入力</p>

      {participants.map((p) => {
        const entered = p.buy_chips !== null && p.final_chips !== null
        return (
          <div
            key={p.id}
            className={`participant-row${entered ? ' entered' : ''}`}
            onClick={() => setModalParticipant(p)}
          >
            <div className="participant-row-header">
              <span className="participant-row-name">{p.name}</span>
              <div className="participant-row-actions">
                {entered && <span className="badge-entered">入力済</span>}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(p)
                  }}
                >
                  削除
                </button>
              </div>
            </div>
            {entered ? (
              <div className="participant-row-values">
                <span>購入: {p.buy_chips?.toLocaleString()}</span>
                <span>最終: {p.final_chips?.toLocaleString()}</span>
                <span>場所代: ¥{p.venue_fee.toLocaleString()}</span>
              </div>
            ) : (
              <div className="participant-row-empty">タップして入力</div>
            )}
          </div>
        )
      })}

      {showAddInput ? (
        <div className="add-participant-form">
          <input
            className="form-input"
            type="text"
            value={addingName}
            onChange={(e) => setAddingName(e.target.value)}
            placeholder="名前を入力"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
          />
          <div className="add-participant-buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddParticipant}
              disabled={!addingName.trim()}
            >
              追加
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowAddInput(false)
                setAddingName('')
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="add-participant-btn"
          onClick={() => setShowAddInput(true)}
        >
          ＋ 参加者を追加
        </button>
      )}

      <div style={{ marginTop: '24px' }}>
        {ready && calcResult ? (
          <>
            {calcResult.hasFractionAdjustment && (
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
                    <th>支払った場所代</th>
                    <th>精算額</th>
                  </tr>
                </thead>
                <tbody>
                  {calcResult.results.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.buyChips.toLocaleString()}</td>
                      <td>{r.finalChips.toLocaleString()}</td>
                      <td className={r.chipPnL >= 0 ? 'amount-positive' : 'amount-negative'}>
                        {r.chipPnL >= 0 ? '+' : ''}
                        {Math.round(r.chipPnL).toLocaleString()}円
                      </td>
                      <td>{r.venue.toLocaleString()}円</td>
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
              {calcResult.settlements.length === 0 ? (
                <p className="empty-state">精算は不要です</p>
              ) : (
                calcResult.settlements.map((s, i) => (
                  <div key={i} className="settlement-item">
                    <span className="settlement-from">{s.from}</span>
                    <span className="settlement-arrow">→</span>
                    <span className="settlement-to">{s.to}</span>
                    <span className="settlement-amount">{s.amount.toLocaleString()}円</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <p className="section-header">精算結果</p>
            <div className="reasons-list">
              {reasons.map((reason, i) => (
                <div key={i} className="reason-item">
                  {reason}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalParticipant && (
        <InputModal
          participant={modalParticipant}
          onClose={() => {
            setModalParticipant(null)
            fetchParticipants()
          }}
        />
      )}
    </div>
  )
}
