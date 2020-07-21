import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Layout } from 'antd'

import NavBar from 'Components/NavBar'
import Footer from 'Components/Footer'
import Router from 'Components/Router'

const App = () => {
  const location = useLocation()
  const user = useSelector(state => state.user)

  return (
    <Layout>
      {location.pathname !== '/' && <NavBar user={user}/>}
      <Router />
      {location.pathname !== '/' && <Footer />}
    </Layout>
  )
}

export default App