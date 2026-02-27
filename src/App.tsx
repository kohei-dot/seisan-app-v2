import { useState } from 'react'
import type { AppState, Participant } from './types'
import { SetupScreen } from './components/SetupScreen'
import { ParticipantScreen } from './components/ParticipantScreen'
import { ResultScreen } from './components/ResultScreen'

function createParticipant(): Participant {
  return {
    id: crypto.randomUUID(),
    name: '',
    buyChips: '',
    finalChips: '',
    venue: '',
  }
}

function todayLabel(): string {
  const d = new Date()
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const initialState: AppState = {
  screen: 'setup',
  eventName: todayLabel(),
  coefficient: '5',
  participants: [createParticipant(), createParticipant()],
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState)

  const updateSetup = (eventName: string, coefficient: string) => {
    setState((s) => ({ ...s, eventName, coefficient }))
  }

  const goToParticipants = () => {
    setState((s) => ({ ...s, screen: 'participants' }))
  }

  const goToResult = () => {
    setState((s) => ({ ...s, screen: 'result' }))
  }

  const goBackToParticipants = () => {
    setState((s) => ({ ...s, screen: 'participants' }))
  }

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setState((s) => ({
      ...s,
      participants: s.participants.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  }

  const addParticipant = () => {
    setState((s) => ({
      ...s,
      participants: [...s.participants, createParticipant()],
    }))
  }

  const removeParticipant = (id: string) => {
    setState((s) => ({
      ...s,
      participants: s.participants.filter((p) => p.id !== id),
    }))
  }

  const { screen, eventName, coefficient, participants } = state

  if (screen === 'setup') {
    return (
      <SetupScreen
        eventName={eventName}
        coefficient={coefficient}
        onChange={updateSetup}
        onNext={goToParticipants}
      />
    )
  }

  if (screen === 'participants') {
    return (
      <ParticipantScreen
        eventName={eventName}
        participants={participants}
        onUpdate={updateParticipant}
        onAdd={addParticipant}
        onRemove={removeParticipant}
        onNext={goToResult}
      />
    )
  }

  return (
    <ResultScreen
      eventName={eventName}
      coefficient={parseFloat(coefficient) || 0}
      participants={participants}
      onBack={goBackToParticipants}
    />
  )
}
