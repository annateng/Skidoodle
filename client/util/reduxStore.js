import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import loginReducer from 'Utilities/reducers/loginReducer'
import gameReducer from 'Utilities/reducers/gameReducer'

const reducer = combineReducers({
  user: loginReducer,
  game: gameReducer
})

const persistConfig = {
  key: 'skidoodleInfo',
  storage
}

const persistedReducer = persistReducer(persistConfig, reducer)

export const store = createStore( 
  persistedReducer,
  composeWithDevTools(applyMiddleware(thunk))
)

export const persistor = persistStore(store)
