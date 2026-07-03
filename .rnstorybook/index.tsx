import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRegistry, Platform } from 'react-native';

import { name as appName } from '../app.json';

// Intercept STORYBOOK_WEBSOCKET so the auto-generated storybook.requires.ts
// (which always writes host:'localhost') doesn't break Android sync.
// Android emulator reaches the host machine via 10.0.2.2, not localhost.
const wsHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
let _storybookWs: (typeof globalThis)['STORYBOOK_WEBSOCKET'];
Object.defineProperty(globalThis, 'STORYBOOK_WEBSOCKET', {
  get() { return _storybookWs; },
  set(v) { _storybookWs = { ...v, host: wsHost }; },
  configurable: true,
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { view } = require('./storybook.requires') as typeof import('./storybook.requires');

const StorybookUIRoot = view.getStorybookUI({
  shouldPersistSelection: true,
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

AppRegistry.registerComponent(appName, () => StorybookUIRoot);

export default StorybookUIRoot;
