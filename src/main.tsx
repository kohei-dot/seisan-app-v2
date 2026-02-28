import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TopPage } from './pages/TopPage'
import { SessionPage } from './pages/SessionPage'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
