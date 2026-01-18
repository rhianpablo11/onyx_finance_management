import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TestingPage from './pages/testingPage'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <TestingPage />
  </StrictMode>
)
