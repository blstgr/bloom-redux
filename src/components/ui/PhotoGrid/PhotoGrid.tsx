import React from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { spacing } from '../../../theme';

const REBALANCE_AFTER_FULL_WIDTH_ROLL = 0.5;
const FULL_WIDTH_ROW_ROLL = 0.14;
const THREE_EQUAL_ROW_ROLL = 0.52;
const LEADING_WIDE_ROW_ROLL = 0.76;

// Grid item spans, in columns, for the 3-column layout.
const SINGLE_SPAN = 1;
const DOUBLE_SPAN = 2;
const TRIPLE_SPAN = 3;
const TWO_ROWS_OF_DOUBLE_SPANS_REMAINING = 4;

const PHOTO_GRID_MAX_WIDTH = 361;
const DEFAULT_RANDOM_SEED = 17;
const GRID_HORIZONTAL_MARGIN_COUNT = 2;

// Linear congruential generator constants (Numerical Recipes parameters).
const LCG_MULTIPLIER = 1664525;
const LCG_INCREMENT = 1013904223;
const LCG_MODULUS = 4294967296;

export type PhotoGridProps = {
  columns?: number;
  children: ReactNode;
  gap?: number;
  maxWidth?: number;
  randomSeed?: number;
  style?: ViewStyle;
};

function seededRandom(seed: number) {
  // eslint-disable-next-line no-bitwise
  let state = seed >>> 0;
  return () => {
    // eslint-disable-next-line no-bitwise
    state = (state * LCG_MULTIPLIER + LCG_INCREMENT) >>> 0;
    return state / LCG_MODULUS;
  };
}

function buildRandomThreeColSpans(count: number, seed: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [TRIPLE_SPAN];
  if (count === DOUBLE_SPAN) return [SINGLE_SPAN, DOUBLE_SPAN];
  if (count === TRIPLE_SPAN) return [SINGLE_SPAN, SINGLE_SPAN, SINGLE_SPAN];

  const rand = seededRandom(seed);
  const spans: number[] = [];
  const shouldReserveFullWidthLast = count > TRIPLE_SPAN;
  let remaining = shouldReserveFullWidthLast ? count - 1 : count;
  let lastPatternKey = '';
  let prevWasFullWidth = false;

  while (remaining > 0) {
    let options: number[][];
    if (remaining === DOUBLE_SPAN) {
      options = [[DOUBLE_SPAN, SINGLE_SPAN], [SINGLE_SPAN, DOUBLE_SPAN]];
    } else if (remaining === TRIPLE_SPAN) {
      options = [[SINGLE_SPAN, SINGLE_SPAN, SINGLE_SPAN], [TRIPLE_SPAN]];
    } else if (remaining === TWO_ROWS_OF_DOUBLE_SPANS_REMAINING) {
      options = [[DOUBLE_SPAN, SINGLE_SPAN], [SINGLE_SPAN, DOUBLE_SPAN]];
    } else {
      options = [
        [SINGLE_SPAN, SINGLE_SPAN, SINGLE_SPAN],
        [DOUBLE_SPAN, SINGLE_SPAN],
        [SINGLE_SPAN, DOUBLE_SPAN],
        [TRIPLE_SPAN],
      ];
    }

    // Avoid immediate repetition to keep flow organic.
    const filtered = options.filter(option => option.join(',') !== lastPatternKey);
    const pool = filtered.length > 0 ? filtered : options;

    // Weighted pick: favor mixed rows, occasionally use full-width.
    const roll = rand();
    let pick = pool[Math.floor(rand() * pool.length)];
    const hasFull = pool.some(pattern => pattern.length === 1 && pattern[0] === TRIPLE_SPAN);
    if (prevWasFullWidth && pool.some(pattern => pattern.join(',') === '2,1')) {
      pick = roll < REBALANCE_AFTER_FULL_WIDTH_ROLL ? [DOUBLE_SPAN, SINGLE_SPAN] : [SINGLE_SPAN, DOUBLE_SPAN];
    } else if (hasFull && roll < FULL_WIDTH_ROW_ROLL) {
      pick = [TRIPLE_SPAN];
    } else if (roll < THREE_EQUAL_ROW_ROLL && pool.some(pattern => pattern.join(',') === '1,1,1')) {
      pick = [SINGLE_SPAN, SINGLE_SPAN, SINGLE_SPAN];
    } else if (roll < LEADING_WIDE_ROW_ROLL && pool.some(pattern => pattern.join(',') === '2,1')) {
      pick = [DOUBLE_SPAN, SINGLE_SPAN];
    } else if (pool.some(pattern => pattern.join(',') === '1,2')) {
      pick = [SINGLE_SPAN, DOUBLE_SPAN];
    }

    // Ensure we don't overshoot remaining items.
    while (pick.length > remaining) {
      pick = pick[0] === TRIPLE_SPAN ? [SINGLE_SPAN, SINGLE_SPAN, SINGLE_SPAN] : pick.slice(0, pick.length - 1);
    }

    spans.push(...pick);
    lastPatternKey = pick.join(',');
    prevWasFullWidth = pick.length === 1 && pick[0] === TRIPLE_SPAN;
    remaining -= pick.length;
  }

  if (shouldReserveFullWidthLast) spans.push(TRIPLE_SPAN);

  return spans.slice(0, count);
}

function getGridItemKey(item: ReactNode, index: number) {
  if (React.isValidElement(item) && item.key != null) return item.key;
  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'bigint') {
    return `${typeof item}-${String(item)}`;
  }
  return `photo-grid-item-${index}`;
}

export function PhotoGrid({
  columns,
  children,
  gap = spacing.xxs,
  maxWidth = PHOTO_GRID_MAX_WIDTH,
  randomSeed = DEFAULT_RANDOM_SEED,
  style,
}: PhotoGridProps) {
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = React.useState<number | null>(null);
  const items = React.Children.toArray(children);
  const count = items.length;
  const resolvedColumns =
    columns ?? (count <= DOUBLE_SPAN ? SINGLE_SPAN : count === TRIPLE_SPAN ? DOUBLE_SPAN : TRIPLE_SPAN);
  const availableWidth = containerWidth ?? width - spacing.md * GRID_HORIZONTAL_MARGIN_COUNT;
  const gridWidth = Math.min(availableWidth, maxWidth);
  const itemWidth = (gridWidth - gap * (resolvedColumns - SINGLE_SPAN)) / resolvedColumns;
  const randomSpans = React.useMemo(
    () => (resolvedColumns === TRIPLE_SPAN ? buildRandomThreeColSpans(count, randomSeed) : []),
    [count, randomSeed, resolvedColumns],
  );

  return (
    <View
      onLayout={event => {
        const nextWidth = Math.floor(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== containerWidth) setContainerWidth(nextWidth);
      }}
      // eslint-disable-next-line react-native/no-inline-styles
      style={[styles.grid, { gap, width: '100%' }, style]}>
      {items.map((item, index) => {
        let itemSpan = SINGLE_SPAN;
        const isLast = index === count - 1;

        if (resolvedColumns === TRIPLE_SPAN) {
          itemSpan = randomSpans[index] ?? SINGLE_SPAN;
          if (isLast && count > resolvedColumns) itemSpan = TRIPLE_SPAN;
        } else if (resolvedColumns > SINGLE_SPAN && count > resolvedColumns && count % resolvedColumns !== 0) {
          if (isLast) itemSpan = resolvedColumns;
        }

        const widthForItem =
            itemSpan === resolvedColumns
            ? gridWidth
            : itemSpan === DOUBLE_SPAN
              ? itemWidth * DOUBLE_SPAN + gap
              : itemWidth;

        return (
          <View key={getGridItemKey(item, index)} style={{ width: widthForItem }}>
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
