import React from 'react'
import { Route, Switch } from 'react-router-dom'

import FrontPage from 'Components/FrontPage'
import Login from 'Components/Login'
import GameView from 'Components/GameView'
import Profile from 'Components/Profile'
import Home from 'Components/Home'
import Signup from 'Components/Signup'
import AddFriends from 'Components/AddFriends'
import Invite from 'Components/Invite'
import Rules from 'Components/Rules'
import FreeDraw from 'Components/FreeDraw'
import PracticeMode from 'Components/PracticeMode'
import NoMatch from 'Components/NoMatch'

const Router = () => {

  return (
    <div className='content' style={{ padding: '0 50px' }}>
      <Switch>
        <Route exact path='/' component={FrontPage} />
        <Route path='/login' component={Login} />
        <Route path='/game/:gameId' component={GameView} />
        <Route path='/home' component={Home} />
        <Route path='/signup' component={Signup} />
        <Route path='/add-friends' component={AddFriends} />
        <Route path='/profile/:userId' component={Profile} />
        <Route path='/send-invite' component={Invite} />
        <Route path='/about' component={Rules} />
        <Route path='/free-doodle' component={FreeDraw} />
        <Route path='/practice-mode' component={PracticeMode} />
        <Route path='*' component={NoMatch} />
      </Switch>
    </div>
  )
}

export default Router
