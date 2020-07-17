const gameReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_GAME': 
      return {
        ...state,
        activeGame: action.data
      }
    case 'SAVE_GUESSES':
      const gameWithGuesses = { 
        ...state.activeGame, 
        guesses: action.data.guesses 
      }
      delete gameWithGuesses.doodlesToGuess
      return {
        ...state,
        activeGame: gameWithGuesses
      }
    case 'SAVE_DOODLES':
      const gameWithDoodles = {
        ...state.activeGame,
        doodlesToSend: action.data.doodles
      }
      return {
        ...state,
        activeGame: gameWithDoodles
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

export const saveGuesses = guesses => {
  return {
    type: 'SAVE_GUESSES',
    data: {
      guesses
    }
  }
}

export const saveDoodles = doodles => {
  return {
    type: 'SAVE_DOODLES',
    data: {
      doodles
    }
  }
}

export default gameReducer