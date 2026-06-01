import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { IconButton } from '../IconButton/IconButton';
import { PlantCard } from '../PlantCard/PlantCard';
import { PlantGallery } from './index';

const meta = {
  title: 'Spec/PlantGallery',
  component: PlantGallery,
} satisfies Meta<typeof PlantGallery>;

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
  return <PlantCard image={cards[i]} plantId={`${i + 1}`} />;
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
    <PlantGallery>
      <Plant i={0} />
    </PlantGallery>
  ),
};

export const C_TwoColumns: Story = {
  name: 'Two columns',
  args: {} as never,
  render: () => (
    <PlantGallery>
      <Plant i={0} />
      <Plant i={1} />
      <Plant i={2} />
    </PlantGallery>
  ),
};

export const D_ThreeColumns: Story = {
  name: 'Three columns',
  args: {} as never,
  render: () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <PlantGallery>
        <Plant i={0} />
        <Plant i={1} />
        <Plant i={2} />
        <Plant i={3} />
        <Plant i={4} />
        <Plant i={5} />
        <Plant i={6} />
        <Plant i={7} />
        <Plant i={8} />
      </PlantGallery>
    </ScrollView>
  ),
};

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.xl,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
});

function InteractiveGridDemo() {
  const [count, setCount] = React.useState(1);
  const maxCount = 50;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.controls}>
        <IconButton
          icon="minus"
          onPress={() => setCount(prev => Math.max(1, prev - 1))}
          variant="secondary"
        />
        <IconButton
          icon="plus"
          onPress={() => setCount(prev => Math.min(maxCount, prev + 1))}
          variant="secondary"
        />
      </View>
      <PlantGallery randomSeed={17}>
        {Array.from({ length: count }, (_, i) => (
          <Plant key={`plant-${i}`} i={i % cards.length} />
        ))}
      </PlantGallery>
    </ScrollView>
  );
}
