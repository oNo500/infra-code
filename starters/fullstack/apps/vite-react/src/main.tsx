import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'

import './styles/globals.css'
import { AppProvider } from '@/app/providers'
import { router } from '@/app/router'

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
)
