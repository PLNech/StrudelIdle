import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Removed debugging block that attempted to import interfaces as runtime values.
// Interfaces (like 'Module' and 'GameState') are compile-time constructs
// and do not exist as named exports in the final JavaScript bundle.
// The types are still correctly used by TypeScript for type checking in other files.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
