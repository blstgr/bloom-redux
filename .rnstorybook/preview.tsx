import type { Preview } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { gradients, spacing } from '../src/theme';

const preview: Preview = {
  decorators: [
    Story => (
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} style={styles.screen}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%">
              <Defs>
                <LinearGradient id="storybookBg" x1="0%" x2="0%" y1="0%" y2="100%">
                  <Stop offset="0%" stopColor={gradients.appBackground[0]} />
                  <Stop offset="100%" stopColor={gradients.appBackground[1]} />
                </LinearGradient>
              </Defs>
              <Rect fill="url(#storybookBg)" height="100%" width="100%" x="0" y="0" />
            </Svg>
          </View>
          <View style={styles.canvas}>
            <Story />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: (a, b) => {
        const titleA = a.title ?? '';
        const titleB = b.title ?? '';
        const [groupA, ...restA] = titleA.split('/');
        const [groupB, ...restB] = titleB.split('/');
        const kindA = restA.join('/');
        const kindB = restB.join('/');

        if (groupA !== groupB) return groupA.localeCompare(groupB);
        if (kindA !== kindB) return kindA.localeCompare(kindB);

        return 0;
      },
    },
  },
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: 'stretch',
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    maxWidth: 430,
    overflow: 'hidden',
    padding: spacing.xl,
    width: '100%',
  },
  screen: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});

export default preview;
