import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './utils/LanguageContext.jsx'
import './index.css'
import './admin.css'
import App from './App.jsx'

// Punto de entrada de la aplicación que carga React y dibuja el componente principal dentro del HTML, configurando el soporte para idiomas y navegación
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
