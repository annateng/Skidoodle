const gameReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_GAME': 
      return {
        ...state,
        activeGame: action.data
      }
  }
  return state
}

export const setActiveGame = activeGame => {
  return {
    type: 'SET_ACTIVE_GAME',
    data: {
      ...activeGame
    }
  }
}

export default gameReducer