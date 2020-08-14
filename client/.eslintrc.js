const path = require('path');

module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    es2020: true,
  },
  plugins: [
    'react',
  ],
  extends: [
    'plugin:react/recommended',
    'plugin:import/react',
    'airbnb/hooks',
  ],
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['Utilities', path.resolve(__dirname, 'util')],
          ['Components', path.resolve(__dirname, 'components')],
          ['Assets', path.resolve(__dirname, 'assets')],
          ['@root', path.resolve(__dirname, '..')],
        ],
        extensions: ['.js'],
      },
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-param-reassign': 'off',
    'no-extend-native': 'off',
    'no-bitwise': 'off',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
};
