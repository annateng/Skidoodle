import React from 'react'

const Footer = () => (
  <div className="footer" >
  <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'row' }} className='centered-div'>
    <div style={{ width: '33%'}}>
    <div>Created by Anna Teng</div> 
    <a href='https://github.com/annateng'>https://github.com/annateng</a>
    </div>
    <div style={{ width: '33%', display: 'flex', alignItems: 'bottom', flexDirection: 'column' }}>
    <div>Contact me:</div>
    <div>(781) 789-6616</div>
    </div>
    <div style={{ height: '100%', width: '33%', display: 'flex', alignItems: 'bottom', flexDirection: 'column' }}>
    <div><a href='mailto:anna.w.teng@gmail.com?subject=[Skidoodle]'>anna.w.teng@gmail.com</a></div>
    </div>
    </div>
  </div>
)

export default Footer
