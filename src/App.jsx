import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Admin from './pages/Admin'

export default function App() {
  const path = window.location.pathname

  if (path === '/admin') return <Admin />
  return <Landing />
}