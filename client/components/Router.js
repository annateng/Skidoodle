import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Login from 'Components/Login'
import GameView from 'Components/GameView'
import Profile from 'Components/Profile'


        // <Route exact path="/" render={
        //   () => user.username ? <Redirect to="/draw" /> : <Login />
        // } />
const Router = () => {
  const user = useSelector(state => state.user)

  return (
    <div className="content">
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route path="/game/:gameId" component={GameView} />
        <Route path="/profile" component={Profile} />
      </Switch>
    </div>
  )
}

export default Router
