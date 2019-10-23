module.exports = {
    testEnvironment: "node",
    "testPathIgnorePatterns": [
        "/node_modules/"
    ],
    "transformIgnorePatterns": [
        "node_modules/(?!(<package-need-to-transform>|<other-package-need-to-transform>)/)"
    ]
};
