const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      path: false,
      os: false,
      crypto: false,
    },
  },
};