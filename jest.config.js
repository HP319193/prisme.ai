module.exports = () => {
  process.env.TZ = 'UTC';
  return {
    moduleNameMapper: {
      '\\.tsx?$': 'babel-jest',
      '\\.s?css$': 'identity-obj-proxy',
      '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
      '\\.svgr$': '<rootDir>/__mocks__/svgrMock.js',
    },
    testEnvironment: 'jsdom',
    coveragePathIgnorePatterns: [
      // Console
      '<rootDir>/services/console/.*/context.ts',
      '<rootDir>/services/console/utils/yaml.ts',
      '<rootDir>/packages/validation',

      // Runtime
      '<rootDir>/services/runtime/src/eda',
      '<rootDir>/services/runtime/src/cache',
      '<rootDir>/services/runtime/src/storage',
      '<rootDir>/packages/broker',
    ],
    setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    testTimeout: 500,
  };
};
