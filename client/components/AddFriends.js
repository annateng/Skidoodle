import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Typography, Input, List, Button } from 'antd'
import { UserOutlined, CheckOutlined } from '@ant-design/icons'

import { searchForUsers } from 'Utilities/services/userService'

const AddFriends = () => {
  const user = useSelector(state => state.user)
  const [filteredUsers, setFilteredUsers] = useState()

  const seeProfileButton = (userId) => {
    return <Button style={{ float: 'right' }} onClick={() => handleSeeProfile(userId)}>See Profile</Button>
  }

  const addFriendButton = (userId) => {
    return <Button style={{ float: 'right' }} onClick={() => handleAddFriend(userId)}>Add Friend</Button>
    }

  const handleSearch = async value => {
    if (!user.user) {
      console.error('no logged in user data. may need to re-login.')
      return
    }

    const usersFromDb = await searchForUsers(user.user.id, value)
    setFilteredUsers(usersFromDb.map(u => ({
        username: u.username,
        isFriends: u.isFriends,
        button: u.isFriends ? seeProfileButton(u.id) : addFriendButton(u.id),
        additionalStyles: { backgroundColor: u.isFriends ? '#dbffe5' : 'whitesmoke'}
      })))
  }

  return (
    <div className="main-layout" >
      <Typography.Title level={2} style={{ marginBottom: '0' }}>Add new friends </Typography.Title>

      <Input.Search size="large" placeholder="search username" prefix={<UserOutlined />} style={{ marginTop: '20px' }} 
        enterButton='search' onSearch={handleSearch}/>

      <div className='vertical-center-div'>
        { filteredUsers && filteredUsers.length > 0 && 
        
          <List
            className='search-list'
            itemLayout="horizontal"
            dataSource={filteredUsers}
            renderItem={item => (
              <List.Item className='search-list-item' style={{ border: '1px solid #d1d1d1', ...item.additionalStyles }}>
                <List.Item.Meta
                  description={
                    <div>
                      <b style={{ color: 'black' }}>{item.username}</b>
                      {item.button}
                    </div>
                  }
                  title={item.isFriends ? <div><CheckOutlined />Friends</div> : null}
                />
              </List.Item> 
            )}
          />

        }
      </div>
    </div>
  )
}

export default AddFriends