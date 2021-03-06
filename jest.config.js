const { defaults } = require("jest-config");
const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");

module.exports = {
  preset: "jest-puppeteer",
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  collectCoverage: true,
  testEnvironment: "jsdom",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, ""),
  },
  transform: { "^.+\\.(ts|tsx|js|jsx)$": "ts-jest" },

  moduleDirectories: [".", "src", "node_modules"],
  coverageReporters: ["json", "lcov", "text", "clover"], // "text-summary"
};
