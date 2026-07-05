import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

let AppEntryPoint = App;

if (process.env.STORYBOOK_ENABLED === 'true') {
  AppEntryPoint = require('./.rnstorybook').default;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AppEntryPoint;
