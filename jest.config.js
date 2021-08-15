const { defaults } = require("jest-config");
const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");

module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  collectCoverage: true,
  testEnvironment: "jsdom",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, ""),
  },
  moduleDirectories: [".", "src", "node_modules"],
  coverageReporters: ["json", "lcov", "text", "clover"], // "text-summary"
};
