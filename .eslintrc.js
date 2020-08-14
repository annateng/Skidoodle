const path = require('path');

module.exports = {
  extends: [
    'airbnb',
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@root', path.resolve(__dirname)],
        ],
      },
    },
  },
};
