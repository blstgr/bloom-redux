export const spacing = {
  none: 0,
  xxs:  4,
  xs:   8,
  sm:   12,
  md:   16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 40,
} as const;

export const layout = {
  screenPadding:       spacing.md,
  screenBottomPadding: spacing.xxl,
  // Assumes the standard Android/iOS status bar height plus app chrome.
  screenTopPadding:    52,
  sectionGap:          spacing.xl,
  componentGap:        spacing.md,
  tightGap:            spacing.xxs,
} as const;
