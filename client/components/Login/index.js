import React from 'react'
import { Link } from 'react-router-dom'

const FrontPage = () => (
  <>
    Welcome
    <Link to="/messages">Messages</Link>
  </>
)

export default FrontPage
