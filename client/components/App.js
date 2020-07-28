import React from 'react'
import { useLocation } from 'react-router-dom'

import NavBar from 'Components/NavBar'
import Footer from 'Components/Footer'
import Router from 'Components/Router'

const App = () => {
  const location = useLocation()

  return (
    <div style={{ height: '100%' }}>
      {location.pathname !== '/' && <NavBar />}
      <Router />
      {location.pathname !== '/' && <Footer />}
    </div>
  )
}

export default App