import React from 'react';
import { Platform, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';
import { PhotoGrid } from '../src/components/ui/PhotoGrid';
import { PlantCard } from '../src/components/ui/PlantCard';

const plantImage = require('../src/assets/start/start-grid-01.jpg');

function renderForPlatform(platform: 'android' | 'ios') {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => platform,
  });

  let renderer: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <View>
        <Button icon="water" label="Start watering" />
        <Button icon="plus" iconOnly size="small" variant="secondary" />
        <Badge count={3} />
        <Badge day="15" month="May" variant="date" />
        <PhotoGrid randomSeed={17}>
          <PlantCard image={plantImage} badge={{ type: 'badge', icon: 'water' }} />
          <PlantCard image={plantImage} badge={{ type: 'pill', label: '15 May' }} />
          <PlantCard image={plantImage} />
        </PhotoGrid>
      </View>,
    );
  });

  return renderer!.toJSON();
}

function renderComparableTree(platform: 'android' | 'ios') {
  return stripPlatformShadowNodes(JSON.parse(JSON.stringify(renderForPlatform(platform))));
}

function stripPlatformShadowNodes(node: any): any {
  if (!node || typeof node !== 'object') return node;

  const style = node.props?.style;
  const serializedStyle = JSON.stringify(style) ?? '';
  const isAbsoluteDecorativeLayer =
    node.type === 'View' &&
    serializedStyle.includes('"position":"absolute"') &&
    (serializedStyle.includes('rgba(255, 255, 255, 0.2)') ||
      serializedStyle.includes('rgba(255, 255, 255, 0.5)') ||
      serializedStyle.includes('"backgroundColor":"#FFFFFF"') ||
      node.props?.blurAmount === 4);

  if (
    isAbsoluteDecorativeLayer ||
    (node.type === 'View' &&
      serializedStyle.includes('"backgroundColor":"transparent"') &&
      serializedStyle.includes('"overflow":"hidden"')) ||
    (node.type === 'View' &&
      node.props?.pointerEvents === 'none' &&
      (serializedStyle.includes('rgba(43, 38, 31, 0.10)') ||
        serializedStyle.includes('"elevation":3')))
  ) {
    return null;
  }

  if (Array.isArray(node.children)) {
    return {
      ...node,
      children: node.children
        .map(stripPlatformShadowNodes)
        .filter(Boolean),
    };
  }

  return node;
}

describe('shared visual components', () => {
  it.each(['ios', 'android'] as const)('renders on %s without platform-specific crashes', platform => {
    expect(renderForPlatform(platform)).toBeTruthy();
  });

  it('keeps the same rendered tree shape on iOS and Android', () => {
    expect(renderComparableTree('android')).toEqual(renderComparableTree('ios'));
  });
});
