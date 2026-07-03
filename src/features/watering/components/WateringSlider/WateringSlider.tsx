import React from 'react';
import { PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';

import { GlassView } from '../../../../components/ui/GlassView';
import { Icon } from '../../../../components/ui/Icon';
import { colors, radii, shadows, sizes, spacing } from '../../../../theme';

const SLIDER_MAX_WIDTH = 329;
const PROGRESS_FILL_RATIO = 0.35;
// Small px epsilon so the thumb reliably snaps at the visual end.
const COMPLETE_THRESHOLD_OFFSET = 2;
const SLIDER_HORIZONTAL_MARGIN_COUNT = 2;

export type WateringSliderState = 'default' | 'progress' | 'completed';

export type WateringSliderProps = {
  accessibilityLabel?: string;
  disabled?: boolean;
  onComplete?: () => void;
  state?: WateringSliderState;
};

export function WateringSlider({
  accessibilityLabel = 'Complete watering',
  disabled = false,
  onComplete,
  state,
}: WateringSliderProps) {
  const { width } = useWindowDimensions();
  const sliderWidth = Math.min(width - spacing.xxl * SLIDER_HORIZONTAL_MARGIN_COUNT, SLIDER_MAX_WIDTH);
  const minThumbWidth = sizes.button.default;
  // Keep a small epsilon so reaching the visual end reliably counts as completed.
  const completedThreshold = sliderWidth - COMPLETE_THRESHOLD_OFFSET;

  const [internalState, setInternalState] = React.useState<WateringSliderState>('default');
  const [dragWidth, setDragWidth] = React.useState<number>(minThumbWidth);
  const dragStartWidthRef = React.useRef<number>(minThumbWidth);
  const currentWidthRef = React.useRef<number>(minThumbWidth);
  const prevSliderWidthRef = React.useRef<number>(sliderWidth);

  const activeState = state ?? internalState;

  React.useEffect(() => {
    if (state === 'default') {
      setDragWidth(minThumbWidth);
      currentWidthRef.current = minThumbWidth;
      prevSliderWidthRef.current = sliderWidth;
      return;
    }
    if (state === 'progress') {
      setDragWidth(sliderWidth * PROGRESS_FILL_RATIO);
      currentWidthRef.current = sliderWidth * PROGRESS_FILL_RATIO;
      prevSliderWidthRef.current = sliderWidth;
      return;
    }
    if (state === 'completed') {
      setDragWidth(sliderWidth);
      currentWidthRef.current = sliderWidth;
      prevSliderWidthRef.current = sliderWidth;
      return;
    }

    if (internalState === 'completed') {
      setDragWidth(sliderWidth);
      currentWidthRef.current = sliderWidth;
    } else if (internalState === 'default') {
      setDragWidth(minThumbWidth);
      currentWidthRef.current = minThumbWidth;
    } else if (internalState === 'progress' && prevSliderWidthRef.current !== sliderWidth) {
      // Proportionally scale thumb position when sliderWidth changes mid-drag (e.g. orientation flip).
      const ratio = currentWidthRef.current / prevSliderWidthRef.current;
      const scaled = Math.max(minThumbWidth, Math.min(sliderWidth, sliderWidth * ratio));
      currentWidthRef.current = scaled;
      setDragWidth(scaled);
    }
    prevSliderWidthRef.current = sliderWidth;
  }, [internalState, minThumbWidth, sliderWidth, state]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled && state == null,
        onMoveShouldSetPanResponder: (_, gesture) => !disabled && state == null && Math.abs(gesture.dx) > 1,
        onPanResponderGrant: () => {
          dragStartWidthRef.current = currentWidthRef.current;
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
    [completedThreshold, disabled, minThumbWidth, onComplete, sliderWidth, state], // dragWidth intentionally omitted — grant reads currentWidthRef instead
  );

  const completeSlider = React.useCallback(() => {
    if (disabled || state != null) return;
    currentWidthRef.current = sliderWidth;
    setDragWidth(sliderWidth);
    setInternalState('completed');
    onComplete?.();
  }, [disabled, onComplete, sliderWidth, state]);

  return (
    <View style={[styles.trackShadow, { width: sliderWidth }]}>
      <View
        accessibilityActions={[{ name: 'activate', label: 'Complete' }]}
        accessibilityLabel={accessibilityLabel}
        onAccessibilityAction={event => {
          if (event.nativeEvent.actionName === 'activate') completeSlider();
        }}
        accessibilityRole="button"
        accessibilityState={{ checked: activeState === 'completed', disabled }}
        style={[
          styles.track,
          activeState === 'completed' && styles.completedTrack,
        ]}
        {...(state == null ? panResponder.panHandlers : undefined)}>
        {activeState !== 'completed' ? <GlassView border={false} style={styles.blurLayer} /> : null}
        <View
          style={[
            styles.thumb,
            activeState === 'completed' && styles.completedThumb,
            activeState !== 'completed' && { width: dragWidth },
          ]}>
          <Icon name={activeState === 'completed' ? 'check' : 'water'} color={colors.icon.inverse} />
        </View>
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
    height: sizes.button.default,
    justifyContent: 'center',
    paddingLeft: spacing.lg,
    width: sizes.button.default,
  },
  trackShadow: {
    borderRadius: radii.pill,
    ...shadows.soft,
  },
  track: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface.glass,
    borderColor: colors.border.white,
    borderRadius: radii.pill,
    borderWidth: sizes.border.thin,
    height: sizes.button.default,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
});
