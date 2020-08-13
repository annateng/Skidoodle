const path = require('path');

module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:import/react',
    'airbnb',
    'airbnb/hooks',
  ],
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@root', path.resolve(__dirname)],
          ['@controllers', path.resolve(__dirname, 'server/controllers')],
          ['@middleware', path.resolve(__dirname, 'server/middleware')],
          ['@util', path.resolve(__dirname, 'server/util')],
          ['@models', path.resolve(__dirname, 'server/models')],
          ['@resources', path.resolve(__dirname, 'server/resources')],
          ['Utilities', path.resolve(__dirname, 'client/util')],
          ['Components', path.resolve(__dirname, 'client/components')],
          ['Assets', path.resolve(__dirname, 'client/assets')],
        ],
      },
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-extend-native': 'off',
    'no-bitwise': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-param-reassign': 'off',
    'react/jsx-filename-extension': [1,
      { extensions: ['.js', '.jsx'] }],
  },
};
