import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Logo } from '../components/brand/Logo';
import { StartScreenAssets } from '../components/brand/StartScreenAssets';
import { AppText } from '../components/ui/AppText';
import { BottomActions } from '../components/ui/BottomActions';
import { Button } from '../components/ui/Button';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { SCREENS, type AuthStartScreenProps } from '../navigation';
import { fontFamilies, spacing } from '../theme';

const AUTH_CONTENT_WIDTH = 327;
const AUTH_LOGO_WIDTH = 225;
const AUTH_TAGLINE_FONT_SIZE = 24;
const AUTH_TAGLINE_LINE_HEIGHT = 29;

export function AuthStartScreen({ navigation }: AuthStartScreenProps) {
  const enterApp = React.useCallback(() => {
    navigation.replace(SCREENS.SETTINGS_DRAWER, {
      params: { screen: SCREENS.HOME },
      screen: SCREENS.MAIN_TABS,
    });
  }, [navigation]);

  return (
    <ScreenLayout
      contentLayout="split-center"
      bottomActionsOverlay={false}
      bottomActions={(
        <BottomActions
          primaryButton={(
            <View style={styles.ctaWrap}>
              <Button
                icon="google"
                label="Continue with Google"
                layout="fill"
                onPress={enterApp}
              />
            </View>
          )}
        />
      )}>
      <StartScreenAssets />
      <View style={styles.brand}>
        <Logo width={AUTH_LOGO_WIDTH} />
        <AppText align="center" style={styles.tagline}>
          Watering reminders for people trying their best
        </AppText>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    gap: spacing.md,
    width: AUTH_CONTENT_WIDTH,
  },
  ctaWrap: {
    width: AUTH_CONTENT_WIDTH,
  },
  tagline: {
    fontFamily: fontFamilies.body,
    fontSize: AUTH_TAGLINE_FONT_SIZE,
    lineHeight: AUTH_TAGLINE_LINE_HEIGHT,
  },
});
