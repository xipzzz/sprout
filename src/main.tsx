import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.tsx'
import ReportButton from './components/ReportButton.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ReportButton />
  </StrictMode>,
)
