import type { ImageSourcePropType } from 'react-native';

const startGridImage01 = require('./start-grid-01.jpg');
const startGridImage02 = require('./start-grid-02.jpg');
const startGridImage03 = require('./start-grid-03.jpg');
const startGridImage04 = require('./start-grid-04.jpg');
const startGridImage05 = require('./start-grid-05.jpg');
const startGridImage06 = require('./start-grid-06.jpg');
const startGridImage07 = require('./start-grid-07.jpg');
const startGridImage08 = require('./start-grid-08.jpg');
const startGridImage09 = require('./start-grid-09.jpg');

export type StartGridImage = {
  id: string;
  source: ImageSourcePropType;
};

export const startGridImageItems: StartGridImage[] = [
  { id: 'start-grid-01', source: startGridImage01 },
  { id: 'start-grid-02', source: startGridImage02 },
  { id: 'start-grid-03', source: startGridImage03 },
  { id: 'start-grid-04', source: startGridImage04 },
  { id: 'start-grid-05', source: startGridImage05 },
  { id: 'start-grid-06', source: startGridImage06 },
  { id: 'start-grid-07', source: startGridImage07 },
  { id: 'start-grid-08', source: startGridImage08 },
  { id: 'start-grid-09', source: startGridImage09 },
];

export const startGridImages: ImageSourcePropType[] = startGridImageItems.map(item => item.source);
