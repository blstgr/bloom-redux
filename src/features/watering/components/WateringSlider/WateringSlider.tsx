import React from 'react';
import { PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, radii, shadows, sizes, spacing } from '../../../../theme';
import { GlassView } from '../../../../components/ui/GlassView';
import { Icon } from '../../../../components/ui/Icon';

export type WateringSliderState = 'default' | 'progress' | 'completed';

export type WateringSliderProps = {
  disabled?: boolean;
  onComplete?: () => void;
  state?: WateringSliderState;
};

export function WateringSlider({
  disabled = false,
  onComplete,
  state,
}: WateringSliderProps) {
  const maxSliderWidth = sizes.watering.sliderMaxWidth;
  const progressThumbWidth = sizes.watering.sliderProgressWidth;
  const { width } = useWindowDimensions();
  const sliderWidth = Math.min(width - spacing.xxl * 2, maxSliderWidth);
  const minThumbWidth = sizes.button.normal;
  // Keep a small epsilon so reaching the visual end reliably counts as completed.
  const completedThreshold = sliderWidth - sizes.watering.completeThresholdOffset;

  const [internalState, setInternalState] = React.useState<WateringSliderState>('default');
  const [dragWidth, setDragWidth] = React.useState(minThumbWidth);
  const dragStartWidthRef = React.useRef(minThumbWidth);
  const currentWidthRef = React.useRef(minThumbWidth);

  const activeState = state ?? internalState;

  React.useEffect(() => {
    if (state === 'default') {
      setDragWidth(minThumbWidth);
      currentWidthRef.current = minThumbWidth;
      return;
    }
    if (state === 'progress') {
      setDragWidth(progressThumbWidth);
      currentWidthRef.current = progressThumbWidth;
      return;
    }
    if (state === 'completed') {
      setDragWidth(sliderWidth);
      currentWidthRef.current = sliderWidth;
      return;
    }

    if (internalState === 'completed') {
      setDragWidth(sliderWidth);
      currentWidthRef.current = sliderWidth;
    } else if (internalState === 'default') {
      setDragWidth(minThumbWidth);
      currentWidthRef.current = minThumbWidth;
    }
  }, [internalState, minThumbWidth, progressThumbWidth, sliderWidth, state]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled && state == null,
        onMoveShouldSetPanResponder: (_, gesture) => !disabled && state == null && Math.abs(gesture.dx) > 1,
        onPanResponderGrant: () => {
          dragStartWidthRef.current = dragWidth;
        },
        onPanResponderMove: (_, gesture) => {
          const nextWidth = Math.max(
            minThumbWidth,
            Math.min(sliderWidth, dragStartWidthRef.current - gesture.dx),
          );

          currentWidthRef.current = nextWidth;
          setDragWidth(nextWidth);
          setInternalState(nextWidth >= completedThreshold ? 'completed' : 'progress');
        },
        onPanResponderRelease: () => {
          if (currentWidthRef.current >= completedThreshold) {
            currentWidthRef.current = sliderWidth;
            setDragWidth(sliderWidth);
            setInternalState('completed');
            onComplete?.();
            return;
          }

          currentWidthRef.current = minThumbWidth;
          setDragWidth(minThumbWidth);
          setInternalState('default');
        },
      }),
    [completedThreshold, disabled, minThumbWidth, onComplete, sliderWidth, state],
  );

  return (
    <View
      accessibilityRole="button"
      accessibilityState={{ checked: activeState === 'completed', disabled }}
      style={[
        styles.track,
        { width: sliderWidth },
        activeState === 'completed' && styles.completedTrack,
      ]}
      {...(state == null ? panResponder.panHandlers : undefined)}>
      {activeState !== 'completed' ? <GlassView style={styles.blurLayer} /> : null}
      <View
        style={[
          styles.thumb,
          activeState === 'completed' && styles.completedThumb,
          activeState !== 'completed' && { width: dragWidth },
        ]}>
        <Icon name={activeState === 'completed' ? 'check' : 'water'} color={colors.icon.inverse} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blurLayer: {
    ...StyleSheet.absoluteFill,
  },
  completedThumb: {
    backgroundColor: colors.brand.green,
    width: '100%',
  },
  completedTrack: {
    backgroundColor: colors.brand.green,
  },
  thumb: {
    alignItems: 'flex-start',
    backgroundColor: colors.action.primary,
    borderRadius: radii.pill,
    height: sizes.button.normal,
    justifyContent: 'center',
    paddingLeft: spacing.lg,
    width: sizes.button.normal,
  },
  track: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface.glass,
    borderColor: colors.border.white,
    borderRadius: radii.pill,
    borderWidth: sizes.border.thin,
    height: sizes.button.normal,
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
});
