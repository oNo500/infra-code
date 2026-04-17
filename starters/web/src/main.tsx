import { createRoot } from 'react-dom/client'

import { App } from './app'
import './styles.css'

const rootEl = document.querySelector('#root')
if (!rootEl) throw new Error('#root element not found')
createRoot(rootEl).render(<App />)
