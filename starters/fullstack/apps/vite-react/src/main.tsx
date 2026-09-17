import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'

import './styles/globals.css'
import { router } from '@/app/router'

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
