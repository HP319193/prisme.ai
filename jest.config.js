module.exports = () => {
  process.env.TZ = "UTC";
  return {
    moduleNameMapper: {
      "\\.tsx?$": "babel-jest",
      "\\.s?css$": "identity-obj-proxy",
    },
    testEnvironment: "jsdom",
    coveragePathIgnorePatterns: [
      "<rootDir>/services/console/.*/context.ts",
      "<rootDir>/services/console/utils/yaml.ts",
      "<rootDir>/packages/validation",
    ],
    setupFiles: ["<rootDir>/.jest/setEnvVars.js"],
  };
};
