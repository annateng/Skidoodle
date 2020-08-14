const path = require('path');

module.exports = {
  env: {
    node: true,
    commonjs: true,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@root', path.resolve(__dirname, '..')],
          ['@controllers', path.resolve(__dirname, 'controllers')],
          ['@middleware', path.resolve(__dirname, 'middleware')],
          ['@util', path.resolve(__dirname, 'util')],
          ['@models', path.resolve(__dirname, 'models')],
          ['@resources', path.resolve(__dirname, 'resources')],
        ],
      },
    },
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-param-reassign': 'off',
  },
};
