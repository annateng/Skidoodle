import React from 'react'
import { Typography } from 'antd'
import { Link, useHistory } from 'react-router-dom'

const NoMatch = () => {
  const history = useHistory()

  return (
    <div className='main-layout' >
      <Typography.Title level={4}>oops, page not found</Typography.Title>
      <b><Link onClick={() => history.goBack()}>Go back</Link></b>
      <b><Link to='/login'>Go to log in</Link></b>
      <b><Link to='/home'>Go home</Link></b>
    </div>
  )
}

export default NoMatch