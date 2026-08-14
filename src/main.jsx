import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { RecaptchaV3Provider } from './components/ui/RecaptchaV3Provider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <RecaptchaV3Provider>
        <App />
      </RecaptchaV3Provider>
    </ErrorBoundary>
  </StrictMode>,
)
