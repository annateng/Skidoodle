import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import 'Assets/styles.less'
import 'rodal/lib/rodal.css'

import App from 'Components/App'
import ErrorBoundary from 'Components/ErrorBoundary'

import { store, persistor } from 'Utilities/reduxStore'

const refresh = () => render(
  <BrowserRouter>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </BrowserRouter>,
  document.getElementById('root'),
)

refresh()

if (module.hot) {
  module.hot.accept()
}
