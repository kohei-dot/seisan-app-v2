import { useState } from 'react'
import type { DbParticipant } from '../types'
import { supabase } from '../lib/supabase'

interface Props {
  participant: DbParticipant
  onClose: () => void
}

export function InputModal({ participant, onClose }: Props) {
  const [buyChips, setBuyChips] = useState(participant.buy_chips?.toString() ?? '')
  const [finalChips, setFinalChips] = useState(participant.final_chips?.toString() ?? '')
  const [venueFee, setVenueFee] = useState(participant.venue_fee.toString())
  const [saving, setSaving] = useState(false)

  const isValid = buyChips !== '' && finalChips !== ''

  const handleSave = async () => {
    if (!isValid || saving) return
    setSaving(true)
    await supabase
      .from('participants')
      .update({
        buy_chips: parseInt(buyChips, 10),
        final_chips: parseInt(finalChips, 10),
        venue_fee: parseInt(venueFee, 10) || 0,
      })
      .eq('id', participant.id)
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{participant.name}</h2>
        </div>
        <div className="modal-body">
          <div className="input-row">
            <div className="form-group">
              <label className="form-label">購入チップ</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                value={buyChips}
                onChange={(e) => setBuyChips(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">最終チップ</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                value={finalChips}
                onChange={(e) => setFinalChips(e.target.value)}
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
              value={venueFee}
              onChange={(e) => setVenueFee(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!isValid || saving}
            onClick={handleSave}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
