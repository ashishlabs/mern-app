const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Path to your Next.js app
    dir: './',
})

// Jest configuration
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)