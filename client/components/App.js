import React from 'react'
import { useSelector } from 'react-redux'
import NavBar from 'Components/NavBar'
import Footer from 'Components/Footer'
import Router from 'Components/Router'

const App = () => {
  const user = useSelector(state => state.user)

  return (
    <>
      <NavBar user={user}/>
      <Router />
      <Footer />
    </>
  )
}

export default App