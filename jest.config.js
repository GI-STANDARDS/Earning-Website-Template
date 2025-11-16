module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/backend'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/tests/**',
    '!backend/config/**',
    '!backend/logs/**',
    '!node_modules/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/backend/tests/',
    '/backend/config/'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  setupFilesAfterEnv: ['<rootDir>/backend/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  bail: false,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: '50%',
  collectCoverage: false, // Set to true when running coverage
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testRegex: '(/__tests__/|/(tests|test)/).*\\.test\\.js$',
  moduleFileExtensions: ['js', 'json', 'node'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  preset: undefined,
  timers: 'modern'
};
