module.exports = {
    testEnvironment: "node",
    "testPathIgnorePatterns": [
        "/node_modules/"
    ],
    transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$"],
    "transform": {
        "^.+\\.js$": "babel-jest",
        "^.+\\.(js|jsx|mjs)$": "<rootDir>/config/jest/jest-transformer.js"
    },
    collectCoverageFrom: ["src/**/*.{js,jsx,mjs}"],
    testMatch: ["<rootDir>/src/**/__tests__/**/*.{js,jsx,mjs}", "<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs}"],
};
