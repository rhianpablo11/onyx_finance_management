import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import TestingPage from './pages/testingPage'
// import InitialPage from './pages/initialPage'
import LoginPage from './pages/loginPage'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <LoginPage />
  </StrictMode>
)
