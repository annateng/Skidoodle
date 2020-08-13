import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryParamProvider } from 'use-query-params';

import 'Assets/styles.less';
import 'rodal/lib/rodal.css';

import App from 'Components/App';
import ErrorBoundary from 'Components/ErrorBoundary';
import addFindIndexFrom from 'Utilities/addFindIndexFrom';
import { store, persistor } from 'Utilities/reduxStore';

// add Array.prototype.findIndexFrom
addFindIndexFrom();

const refresh = () => render(
  <BrowserRouter>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <App />
          </QueryParamProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </BrowserRouter>,
  document.getElementById('root'),
);

refresh();

if (module.hot) {
  module.hot.accept();
}
