import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/style.css'
// import './css/bootstrap.css'


// pake ini tapi instlal dulu npm install bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
