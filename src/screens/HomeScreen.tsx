import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { type EdgeInsets } from 'react-native-safe-area-context';

import { startGridImages } from '../assets/start';
import { Logo } from '../components/brand/Logo';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { NavBar } from '../components/ui/NavBar';
import { colors, layout, radii, spacing } from '../theme';

export type HomeScreenProps = {
  safeAreaInsets: EdgeInsets;
};

export function HomeScreen({ safeAreaInsets }: HomeScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: safeAreaInsets.top + spacing.xl,
            paddingBottom: safeAreaInsets.bottom + spacing.nav,
          },
        ]}>
        <View style={styles.header}>
          <Logo width={138} />
          <Button icon="plus" size="small" accessibilityLabel="Add plant" />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <AppText variant="headline">Good morning</AppText>
            <AppText tone="muted">3 plants need a little care today</AppText>
          </View>
          <Button icon="water" label="Start watering" />
        </View>

        <View style={styles.grid}>
          {startGridImages.slice(0, 6).map((source, index) => (
            <Image
              key={index}
              source={source}
              resizeMode="cover"
              style={styles.tile}
            />
          ))}
        </View>
      </ScrollView>

      <NavBar
        activeKey="home"
        items={[
          { key: 'home', icon: 'home' },
          { key: 'plants', icon: 'plant', badgeCount: 3 },
          { key: 'camera', icon: 'camera' },
        ]}
        style={[styles.nav, { bottom: safeAreaInsets.bottom + spacing.md }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.sectionGap,
    paddingHorizontal: layout.screenPadding,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hero: {
    backgroundColor: colors.background.cream,
    borderRadius: radii.lg,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  nav: {
    alignSelf: 'center',
    position: 'absolute',
  },
  screen: {
    backgroundColor: colors.background.warm,
    flex: 1,
  },
  tile: {
    aspectRatio: 1,
    borderRadius: radii.photo,
    flexBasis: '32.5%',
    flexGrow: 1,
  },
});
