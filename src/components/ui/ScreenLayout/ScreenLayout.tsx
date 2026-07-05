import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { gradients, layout, sizes, spacing } from '../../../theme';

const FLOATING_BOTTOM_ACTION_RESERVED_HEIGHT = sizes.nav.item;
const OVERLAY_Z_INDEX = 2;

export type ScreenContentLayout =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'split-center';

type ScreenLayoutBaseProps = {
  bottomActions?: React.ReactNode;
  /**
   * Whether bottomActions floats over the content (persistent tab bar, meant to
   * overlap scrollable content behind its frosted glass) or sits in normal flow
   * below it (single-purpose action button/CTA, never overlapping content).
   */
  bottomActionsOverlay?: boolean;
  children: React.ReactNode;
  /**
   * Shared vertical behavior for the content area. `split-center` keeps the first
   * child fixed at the top and centers the remaining children in the leftover space.
   */
  contentLayout?: ScreenContentLayout;
  contentStyle?: StyleProp<ViewStyle>;
  horizontalPadding?: boolean;
  /** Vertical gap around a non-overlay content block (topActions↔content, content↔bottomActions). */
  stackedGap?: number;
  topActions?: React.ReactNode;
  topActionsOverlay?: boolean;
};

type ScrollableScreenLayoutProps = ScreenLayoutBaseProps & {
  /**
   * Wraps children in a ScrollView instead of a fixed View. Use when content can exceed the
   * screen (e.g. a variable-length list) — leave false for content designed to fit one screen.
   */
  scrollableContent: true;
  /**
   * For titled scroll screens: splits the top gap into fixed + scrollable parts.
   * At rest it preserves the normal 32px rhythm; after scrolling, 16px remains.
   */
  scrollableContentSharesTopGap?: boolean;
};

type StaticScreenLayoutProps = ScreenLayoutBaseProps & {
  scrollableContent?: false;
  scrollableContentSharesTopGap?: never;
};

export type ScreenLayoutProps = ScrollableScreenLayoutProps | StaticScreenLayoutProps;

export function ScreenLayout({
  bottomActions,
  bottomActionsOverlay = true,
  children,
  contentLayout = 'start',
  contentStyle,
  horizontalPadding = false,
  scrollableContent = false,
  scrollableContentSharesTopGap = false,
  stackedGap = spacing.xxl,
  topActions,
  topActionsOverlay = false,
}: ScreenLayoutProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const isOverlay = bottomActions != null && bottomActionsOverlay;
  const isStacked = bottomActions != null && !bottomActionsOverlay;
  const contentContainerProps = scrollableContent
    ? {
        contentInsetAdjustmentBehavior: 'never' as const,
        showsVerticalScrollIndicator: false,
      }
    : {};
  const rootStyle: StyleProp<ViewStyle> = [
    styles.root,
    {
      paddingTop: topActionsOverlay ? 0 : safeAreaInsets.top,
    },
  ];
  const topActionsGap = scrollableContent && scrollableContentSharesTopGap ? spacing.md : stackedGap;
  const topActionsStyle: StyleProp<ViewStyle> = [styles.topActions, { marginBottom: topActionsGap }];
  const contentLayoutStyle = getContentLayoutStyle(
    contentLayout,
  );
  const scrollBottomInsetStyle =
    scrollableContent && isOverlay
      ? {
          paddingBottom:
            safeAreaInsets.bottom +
            FLOATING_BOTTOM_ACTION_RESERVED_HEIGHT +
            stackedGap,
        }
      : null;
  const scrollSharedTopGapStyle =
    scrollableContent && scrollableContentSharesTopGap
      ? { paddingTop: spacing.md }
      : null;
  const bottomActionsStackedStyle: StyleProp<ViewStyle> = [
    styles.bottomActionsStacked,
    { paddingBottom: safeAreaInsets.bottom, paddingTop: stackedGap },
  ];
  const topActionsOverlayStyle: StyleProp<ViewStyle> = [
    styles.topActionsOverlay,
    { top: safeAreaInsets.top },
  ];
  const bottomActionsOverlayStyle: StyleProp<ViewStyle> = [
    styles.bottomActionsOverlay,
    { bottom: safeAreaInsets.bottom },
  ];

  return (
    <LinearGradient colors={[...gradients.appBackground]} style={styles.screen}>
      <View style={rootStyle}>
        {topActions && !topActionsOverlay ? (
          <View style={topActionsStyle}>{topActions}</View>
        ) : null}
        {scrollableContent ? (
          <ScrollView
            {...contentContainerProps}
            style={styles.content}
            contentContainerStyle={[
              styles.scrollContent,
              contentLayoutStyle,
              horizontalPadding && styles.horizontalPadding,
              scrollBottomInsetStyle,
              scrollSharedTopGapStyle,
              contentStyle,
            ]}>
            {renderContentChildren(children, contentLayout)}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.content,
              contentLayoutStyle,
              horizontalPadding && styles.horizontalPadding,
              contentStyle,
            ]}>
            {renderContentChildren(children, contentLayout)}
          </View>
        )}
        {isStacked ? (
          <View style={bottomActionsStackedStyle}>{bottomActions}</View>
        ) : null}
      </View>
      {topActions && topActionsOverlay ? (
        <View style={topActionsOverlayStyle}>{topActions}</View>
      ) : null}
      {isOverlay ? (
        <View style={bottomActionsOverlayStyle}>{bottomActions}</View>
      ) : null}
    </LinearGradient>
  );
}

function getContentLayoutStyle(
  contentLayout: ScreenContentLayout,
): StyleProp<ViewStyle> {
  switch (contentLayout) {
    case 'center':
      return styles.contentCenter;
    case 'end':
      return styles.contentEnd;
    case 'space-between':
      return styles.contentSpaceBetween;
    case 'split-center':
      return styles.contentSplitCenter;
    default:
      return null;
  }
}

function renderContentChildren(
  children: React.ReactNode,
  contentLayout: ScreenContentLayout,
) {
  if (contentLayout !== 'split-center') return children;

  const childArray = React.Children.toArray(children);
  const [topChild, ...centerChildren] = childArray;

  return (
    <>
      {topChild ? <View style={styles.splitTop}>{topChild}</View> : null}
      <View style={styles.splitCenter}>{centerChildren}</View>
    </>
  );
}

const styles = StyleSheet.create({
  bottomActionsOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: OVERLAY_Z_INDEX,
  },
  bottomActionsStacked: {
    width: '100%',
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  contentCenter: {
    justifyContent: 'center',
  },
  contentEnd: {
    justifyContent: 'flex-end',
  },
  contentSpaceBetween: {
    justifyContent: 'space-between',
  },
  contentSplitCenter: {
    gap: spacing.xl,
    paddingTop: spacing.xl,
  },
  horizontalPadding: {
    paddingHorizontal: layout.screenPadding,
  },
  root: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  splitCenter: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  splitTop: {
    width: '100%',
  },
  topActions: {
    paddingHorizontal: layout.screenPadding,
  },
  topActionsOverlay: {
    left: 0,
    paddingHorizontal: layout.screenPadding,
    position: 'absolute',
    right: 0,
    zIndex: OVERLAY_Z_INDEX,
  },
});
