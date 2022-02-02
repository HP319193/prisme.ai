module.exports = {
  moduleNameMapper: {
    '\\.tsx?$': 'babel-jest',
    '\\.s?css$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['.*/context.ts', 'utils/yaml.ts'],
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
};
