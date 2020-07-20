import React from 'react'
import { images } from 'Utilities/common'

const NavBar = ({ user }) => (
  <div className="navbar">
    <img src={images.logo} alt="skidoodle logo" />
    {user && <span>Welcome {user.user.displayName}</span>}
  </div>
)

export default NavBar
