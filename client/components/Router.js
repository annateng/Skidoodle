import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Drawing from 'Components/Drawing'

export default () => (
  <div className="content">
    <Switch>
      <Route exact path="/" component={Drawing} />
    </Switch>
  </div>
)
