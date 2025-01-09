module.exports = {
    preset: "ts-jest", // Use TypeScript for Jest
    testEnvironment: "node", // Node.js environment for backend tests
    setupFiles: ["<rootDir>/jest.setup.js"], // Optional setup file
    testMatch: ["**/__tests__/**/*.test.ts"], // Match test files
    moduleFileExtensions: ["ts", "js"],
  };
  