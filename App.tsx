import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return <HomeScreen safeAreaInsets={safeAreaInsets} />;
}

let AppEntryPoint = App;

if (process.env.STORYBOOK_ENABLED === 'true') {
  AppEntryPoint = require('./.rnstorybook').default;
}

export default AppEntryPoint;
