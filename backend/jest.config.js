module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFiles: ['./jest.setup.js'],
    setupFilesAfterEnv: ['./src/test-setup.ts']
};
