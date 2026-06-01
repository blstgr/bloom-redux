const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@storybook',
  'react-native-ui',
  'dist',
  'index.js',
);

if (!fs.existsSync(filePath)) {
  process.exit(0);
}

const source = fs.readFileSync(filePath, 'utf8');
const before = `if (open) {
\t\t\tshouldScrollOnOpen.current = true;
\t\t\tmenuBottomSheetRef.current?.snapToIndex(1);
\t\t} else {`;

const after = `if (open) {
\t\t\tshouldScrollOnOpen.current = true;
\t\t\tmenuBottomSheetRef.current?.snapToIndex(1);
\t\t\trequestAnimationFrame(() => {
\t\t\t\tmenuBottomSheetRef.current?.snapToIndex(1);
\t\t\t});
\t\t\tsetTimeout(() => {
\t\t\t\tmenuBottomSheetRef.current?.snapToIndex(1);
\t\t\t}, 80);
\t\t} else {`;

if (!source.includes(before) || source.includes('setTimeout(() => {\n\t\t\t\tmenuBottomSheetRef.current?.snapToIndex(1);')) {
  // Continue; we may still need to apply backdrop behavior patch.
}

let next = source;

if (source.includes(before) && !source.includes('setTimeout(() => {\n\t\t\t\tmenuBottomSheetRef.current?.snapToIndex(1);')) {
  next = next.replace(before, after);
}

next = next.replace('pressBehavior: "close"', 'pressBehavior: "none"');

if (next !== source) {
  fs.writeFileSync(filePath, next);
}
