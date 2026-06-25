module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^@react-native-community/blur$': '<rootDir>/__mocks__/reactNativeBlurMock.js',
    '^react-native-linear-gradient$': '<rootDir>/__mocks__/reactNativeLinearGradientMock.js',
  },
};
