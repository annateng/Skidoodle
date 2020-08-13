import axios from 'axios';

const basePath = '/api/users';

let token;

export const setToken = (authToken) => {
  token = `bearer ${authToken}`;
};

export const getActiveGames = async (userId) => {
  const config = {
    headers: { Authorization: token },
  };

  try {
    const res = await axios.get(`${basePath}/${userId}/active-games`, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const getUserData = async (userId) => {
  const config = {
    headers: { Authorization: token },
  };

  try {
    const res = await axios.get(`${basePath}/${userId}`, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const getNotifications = async (userId) => {
  const config = {
    headers: { Authorization: token },
  };

  try {
    const res = await axios.get(`${basePath}/${userId}/notifications`, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const acceptGameRequest = async (userId, gameRequestId) => {
  const config = {
    headers: { Authorization: token },
    params: { action: 'accept' },
  };

  try {
    const res = await axios.post(`${basePath}/${userId}/game-requests/${gameRequestId}`, null, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const rejectGameRequest = async (userId, gameRequestId) => {
  const config = {
    headers: { Authorization: token },
    params: { action: 'reject' },
  };

  try {
    const res = await axios.post(`${basePath}/${userId}/game-requests/${gameRequestId}`, null, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const signUpUser = async (userData) => {
  try {
    const res = await axios.post(`${basePath}`, userData);
    return res.data;
  } catch (e) {
    throw new Error(`status ${e.response.status}: ${e.response.data.error}`);
  }
};

export const searchForUsers = async (userId, queryString) => {
  const config = {
    params: { search: queryString, requesterId: userId },
  };

  try {
    const res = await axios.get(`${basePath}/search`, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const addFriend = async (requesterId, receiverId) => {
  const config = {
    headers: { Authorization: token },
    params: { requesterId },
  };

  try {
    const res = await axios.post(`${basePath}/${receiverId}/friend-requests`, null, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const acceptFriendRequest = async (userId, frId) => {
  const config = {
    headers: { Authorization: token },
    params: { action: 'accept' },
  };

  try {
    const res = await axios.post(`${basePath}/${userId}/friend-requests/${frId}`, null, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const rejectFriendRequest = async (userId, frId) => {
  const config = {
    headers: { Authorization: token },
    params: { action: 'reject' },
  };

  try {
    const res = await axios.post(`${basePath}/${userId}/friend-requests/${frId}`, null, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};

export const sendUpdateSettings = async (settings, userId) => {
  const config = {
    headers: { Authorization: token },
  };

  try {
    const res = await axios.put(`${basePath}/${userId}/update-settings`, settings, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};
