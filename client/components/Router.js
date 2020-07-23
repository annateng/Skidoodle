import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Layout } from 'antd'

import FrontPage from 'Components/FrontPage'
import Login from 'Components/Login'
import GameView from 'Components/GameView'
// import Profile from 'Components/Profile'
import Home from 'Components/Home'
import Signup from 'Components/Signup'

const Router = () => {

  return (
    <div className='content' style={{ padding: '0 50px' }}>
      <Switch>
        <Route exact path='/' component={FrontPage} />
        <Route path='/login' component={Login} />
        <Route path='/game/:gameId' component={GameView} />
        <Route path='/home' component={Home} />
        <Route path='/signup' component={Signup} />
      </Switch>
    </div>
  )
}

export default Router
