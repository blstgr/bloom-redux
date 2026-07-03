// Folders with a barrel (index.ts) and the internal files that must not be
// imported directly from outside the folder — import from the barrel instead.
const BARREL_INTERNALS = {
  AlertModal: ['AlertModal'],
  AppText: ['AppText'],
  Badge: ['Badge'],
  BadgePill: ['BadgePill'],
  BottomActions: ['BottomActions'],
  Button: ['Button', 'GlassButtonSurface', 'glassButtonTokens'],
  EditableTitle: ['EditableTitle'],
  GlassView: ['GlassView'],
  GradientBorder: ['GradientBorder'],
  Icon: ['Icon'],
  Input: ['Input'],
  Loader: ['Loader'],
  Logo: ['Logo'],
  NavBar: ['NavBar', 'NavBarItem'],
  PhotoGrid: ['PhotoGrid', 'PhotoGridItem', 'types'],
  PlantCard: ['PlantCard'],
  PlantDetail: ['PlantDetail'],
  SegmentedBarBase: ['SegmentedBarBase'],
  SettingsPanel: ['SettingsPanel', 'SettingsRow'],
  StartScreenAssets: ['StartScreenAssets'],
  TopActions: ['TopActions'],
  WateringCard: ['WateringCard'],
  WateringSchedule: ['WateringSchedule'],
  WateringSlider: ['WateringSlider'],
};

const noDeepImportPatterns = Object.entries(BARREL_INTERNALS).flatMap(([dir, files]) =>
  files.map(file => ({
    group: [`**/${dir}/${file}`],
    message: `Import from the '${dir}' barrel (its index.ts) instead of '${dir}/${file}' directly.`,
  })),
);

module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['coverage/'],
  plugins: ['import', 'react-native-a11y'],
  rules: {
    // --- Accessibility ---
    // Baseline safety net: every Touchable must carry SOME a11y descriptor
    // (role, label, or accessibilityActions). Satisfied by accessibilityRole
    // alone, so it does NOT catch "icon-only touchable missing a label" —
    // that check has no lint rule and must be done manually each review,
    // same as the orphaned-files criterion below.
    'react-native-a11y/has-valid-accessibility-descriptors': 'error',

    // --- Import ordering ---
    // Catches mid-file imports and enforces: builtins → externals → internals → relatives
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-duplicates': 'error',
    // Catches deep imports when a barrel index.ts exists
    'no-restricted-imports': ['error', { patterns: noDeepImportPatterns }],

    // --- React ---
    // Catches key={index} on lists where items can reorder or be removed
    'react/no-array-index-key': 'warn',

    // --- TypeScript ---
    // Catches `any` that slips through strict mode
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  overrides: [
    {
      // Catches magic numbers in component/screen style & layout code.
      // Exceptions match the project's 9+ rubric: 0, 1, 100, -1.
      files: ['src/components/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/screens/**/*.{ts,tsx}'],
      excludedFiles: ['**/*.stories.tsx', '**/*.test.tsx'],
      rules: {
        'no-magic-numbers': [
          'error',
          {
            ignore: [0, 1, -1, 100],
            ignoreArrayIndexes: true,
            detectObjects: false,
            enforceConst: false,
          },
        ],
      },
    },
  ],
};
