import React from 'react'
import { images } from 'Utilities/common'

const NavBar = ({ user }) => (
  <div className="navbar">
    <img src={images.logo} alt="scribble logo" />
    {user && <span>Welcome {user.displayName}</span>}
  </div>
)

export default NavBar
