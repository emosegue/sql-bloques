module.exports = {
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest'
    },
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    testMatch: ['**/*.test.js', '**/*.test.jsx']
  };