import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { spacing } from '../../../theme';
import { PlantCard } from '../PlantCard';
import { TopActions } from '../TopActions';

import { PhotoGrid } from './index';

const meta = {
  title: 'Spec/PhotoGrid',
  component: PhotoGrid,
} satisfies Meta<typeof PhotoGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

const cards = [
  require('../../../assets/start/start-grid-01.jpg'),
  require('../../../assets/start/start-grid-02.jpg'),
  require('../../../assets/start/start-grid-03.jpg'),
  require('../../../assets/start/start-grid-04.jpg'),
  require('../../../assets/start/start-grid-05.jpg'),
  require('../../../assets/start/start-grid-06.jpg'),
  require('../../../assets/start/start-grid-07.jpg'),
  require('../../../assets/start/start-grid-08.jpg'),
  require('../../../assets/start/start-grid-09.jpg'),
];

function Plant({ i }: { i: number }) {
  return <PlantCard image={cards[i]} />;
}

export const A_All: Story = {
  name: 'All',
  args: {} as never,
  render: () => <InteractiveGridDemo />,
};

export const B_OneColumn: Story = {
  name: 'One column',
  args: {} as never,
  render: () => (
    <PhotoGrid>
      <Plant key="plant-0" i={0} />
    </PhotoGrid>
  ),
};

export const C_TwoColumns: Story = {
  name: 'Two columns',
  args: {} as never,
  render: () => (
    <PhotoGrid>
      <Plant key="plant-0" i={0} />
      <Plant key="plant-1" i={1} />
      <Plant key="plant-2" i={2} />
    </PhotoGrid>
  ),
};

export const D_ThreeColumns: Story = {
  name: 'Three columns',
  args: {} as never,
  render: () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <PhotoGrid>
        <Plant key="plant-0" i={0} />
        <Plant key="plant-1" i={1} />
        <Plant key="plant-2" i={2} />
        <Plant key="plant-3" i={3} />
        <Plant key="plant-4" i={4} />
        <Plant key="plant-5" i={5} />
        <Plant key="plant-6" i={6} />
        <Plant key="plant-7" i={7} />
        <Plant key="plant-8" i={8} />
      </PhotoGrid>
    </ScrollView>
  ),
};

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
});

function InteractiveGridDemo() {
  const [count, setCount] = React.useState(6);
  const maxCount = 50;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TopActions
        leftIcon="minus"
        onLeftPress={() => setCount(prev => Math.max(1, prev - 1))}
        onRightPress={() => setCount(prev => Math.min(maxCount, prev + 1))}
        rightIcon="plus"
      />
      <PhotoGrid randomSeed={17}>
        {Array.from({ length: count }, (_, i) => (
          <Plant key={`plant-${i}`} i={i % cards.length} />
        ))}
      </PhotoGrid>
    </ScrollView>
  );
}
