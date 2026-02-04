import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App.jsx'
import './index.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

const theme = createTheme({
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  primaryColor: 'teal',
  defaultRadius: 'md',
  headings: { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' },
  transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)