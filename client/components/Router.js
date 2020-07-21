import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Layout } from 'antd'

import HomePage from 'Components/HomePage'
import Login from 'Components/Login'
import GameView from 'Components/GameView'
import Profile from 'Components/Profile'


        // <Route exact path="/" render={
        //   () => user.username ? <Redirect to="/draw" /> : <Login />
        // } />
const Router = () => {
  const user = useSelector(state => state.user)

  const { Content } = Layout

  return (
    <Content className='content' style={{ padding: '0 50px' }}>
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route path='/login' component={Login} />
        <Route path='/game/:gameId' component={GameView} />
        <Route path='/profile' component={Profile} />
      </Switch>
    </Content>
  )
}

export default Router
