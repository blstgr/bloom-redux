const React = require('react');
const ReactNative = require('react-native');

function interpolate(value, inputRange, outputRange) {
  if (value <= inputRange[0]) return outputRange[0];

  const lastIndex = inputRange.length - 1;
  if (value >= inputRange[lastIndex]) return outputRange[lastIndex];

  const upperIndex = inputRange.findIndex(point => value <= point);
  const lowerIndex = Math.max(0, upperIndex - 1);
  const inputDelta = inputRange[upperIndex] - inputRange[lowerIndex];
  const progress = inputDelta === 0 ? 0 : (value - inputRange[lowerIndex]) / inputDelta;

  return outputRange[lowerIndex] + (outputRange[upperIndex] - outputRange[lowerIndex]) * progress;
}

const Reanimated = {
  ...ReactNative.Animated,
  Extrapolation: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity',
  },
  Image: ReactNative.Image,
  ScrollView: ReactNative.ScrollView,
  Text: ReactNative.Text,
  View: ReactNative.View,
  createAnimatedComponent: component => component,
  interpolate,
  measure: () => null,
  runOnJS: callback => callback,
  scrollTo: () => undefined,
  useAnimatedGestureHandler: handlers => handlers,
  useAnimatedProps: updater => updater(),
  useAnimatedReaction: () => undefined,
  useAnimatedRef: () => React.createRef(),
  useAnimatedScrollHandler: handler => handler,
  useAnimatedStyle: updater => updater(),
  useDerivedValue: updater => ({ value: updater() }),
  useEvent: () => undefined,
  useHandler: () => ({ context: {}, doDependenciesDiffer: false, useWeb: false }),
  useSharedValue: value => ({ value }),
  withDelay: (_delay, value) => value,
  withSpring: value => value,
  withTiming: (value, _config, callback) => {
    callback?.(true);
    return value;
  },
};

module.exports = Reanimated;
module.exports.default = Reanimated;
