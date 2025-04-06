import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerWorker } from '@hology/core'
import { HashRouter, Routes, Route } from "react-router";
import Worker from './hology.worker.ts?worker'
import Start from './pages/start/Start.tsx'

registerWorker(() => new Worker())

window.addEventListener('beforeunload', (event) => {
  event.preventDefault()
  event.returnValue = ''
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route index element={<Start />} />
        <Route path="game" element={<App />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)