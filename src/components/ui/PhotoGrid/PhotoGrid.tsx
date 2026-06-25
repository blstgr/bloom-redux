import React from 'react';
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { spacing } from '../../../theme';

export type PhotoGridProps = {
  columns?: number;
  children: ReactNode;
  gap?: number;
  maxWidth?: number;
  randomSeed?: number;
  style?: ViewStyle;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildRandomThreeColSpans(count: number, seed: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [3];
  if (count === 2) return [1, 2];
  if (count === 3) return [1, 1, 1];

  const rand = seededRandom(seed);
  const spans: number[] = [];
  const shouldReserveFullWidthLast = count > 3;
  let remaining = shouldReserveFullWidthLast ? count - 1 : count;
  let lastPatternKey = '';
  let prevWasFullWidth = false;

  while (remaining > 0) {
    let options: number[][];
    if (remaining === 2) {
      options = [[2, 1], [1, 2]];
    } else if (remaining === 3) {
      options = [[1, 1, 1], [3]];
    } else if (remaining === 4) {
      options = [[2, 1], [1, 2]];
    } else {
      options = [[1, 1, 1], [2, 1], [1, 2], [3]];
    }

    // Avoid immediate repetition to keep flow organic.
    const filtered = options.filter(option => option.join(',') !== lastPatternKey);
    const pool = filtered.length > 0 ? filtered : options;

    // Weighted pick: favor mixed rows, occasionally use full-width.
    const roll = rand();
    let pick = pool[Math.floor(rand() * pool.length)];
    const hasFull = pool.some(pattern => pattern.length === 1 && pattern[0] === 3);
    if (prevWasFullWidth && pool.some(pattern => pattern.join(',') === '2,1')) {
      pick = roll < 0.5 ? [2, 1] : [1, 2];
    } else if (hasFull && roll < 0.14) {
      pick = [3];
    } else if (roll < 0.52 && pool.some(pattern => pattern.join(',') === '1,1,1')) {
      pick = [1, 1, 1];
    } else if (roll < 0.76 && pool.some(pattern => pattern.join(',') === '2,1')) {
      pick = [2, 1];
    } else if (pool.some(pattern => pattern.join(',') === '1,2')) {
      pick = [1, 2];
    }

    // Ensure we don't overshoot remaining items.
    while (pick.length > remaining) {
      pick = pick[0] === 3 ? [1, 1, 1] : pick.slice(0, pick.length - 1);
    }

    spans.push(...pick);
    lastPatternKey = pick.join(',');
    prevWasFullWidth = pick.length === 1 && pick[0] === 3;
    remaining -= pick.length;
  }

  if (shouldReserveFullWidthLast) spans.push(3);

  return spans.slice(0, count);
}

export function PhotoGrid({
  columns,
  children,
  gap = spacing.xxs,
  maxWidth = 361,
  randomSeed = 17,
  style,
}: PhotoGridProps) {
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = React.useState<number | null>(null);
  const items = React.Children.toArray(children);
  const count = items.length;
  const resolvedColumns =
    columns ?? (count <= 2 ? 1 : count === 3 ? 2 : 3);
  const availableWidth = containerWidth ?? width - spacing.md * 2;
  const gridWidth = Math.min(availableWidth, maxWidth);
  const itemWidth = (gridWidth - gap * (resolvedColumns - 1)) / resolvedColumns;
  const randomSpans = React.useMemo(
    () => (resolvedColumns === 3 ? buildRandomThreeColSpans(count, randomSeed) : []),
    [count, randomSeed, resolvedColumns],
  );

  return (
    <View
      onLayout={event => {
        const nextWidth = Math.floor(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== containerWidth) setContainerWidth(nextWidth);
      }}
      style={[styles.grid, { gap, width: '100%' }, style]}>
      {items.map((item, index) => {
        let itemSpan = 1;
        const isLast = index === count - 1;

        if (resolvedColumns === 3) {
          itemSpan = randomSpans[index] ?? 1;
          if (isLast && count > resolvedColumns) itemSpan = 3;
        } else if (resolvedColumns > 1 && count > resolvedColumns && count % resolvedColumns !== 0) {
          if (isLast) itemSpan = resolvedColumns;
        }

        const widthForItem =
            itemSpan === resolvedColumns
            ? gridWidth
            : itemSpan === 2
              ? itemWidth * 2 + gap
              : itemWidth;

        return (
          <View key={index} style={{ width: widthForItem }}>
            {item}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
