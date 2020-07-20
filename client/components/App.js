import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import NavBar from 'Components/NavBar'
import Footer from 'Components/Footer'
import Router from 'Components/Router'

const App = () => {
  const location = useLocation()
  const user = useSelector(state => state.user)

  return (
    <>
      {location.pathname !== '/' && <NavBar user={user}/>}
      <Router />
      {location.pathname !== '/' && <Footer />}
    </>
  )
}

export default App