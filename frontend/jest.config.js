module.exports = {
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest'
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    testMatch: ['**/*.test.js', '**/*.test.jsx']
  };