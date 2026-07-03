import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../../../components/ui/Button';
import { spacing } from '../../../../theme';

import { WateringCard } from './WateringCard';

const meta = {
  title: 'Spec/WateringCard',
  component: WateringCard,
  args: {
    day: '15',
    month: 'May',
    imageUrl: 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=900',
  },
} satisfies Meta<typeof WateringCard>;

export default meta;

type Story = StoryObj<typeof meta>;

function WateringCardDemo(args: React.ComponentProps<typeof WateringCard>) {
  const [visible, setVisible] = React.useState(true);

  return (
    <View style={styles.frame}>
      <View style={styles.stack}>
        <View style={styles.topRow}>
          {!visible ? (
            <Button icon="repeat" iconOnly onPress={() => setVisible(true)} size="small" variant="secondary" />
          ) : null}
        </View>

        <View style={styles.cardContainer}>
          {visible ? <WateringCard {...args} onDismiss={() => setVisible(false)} /> : null}
        </View>
      </View>
    </View>
  );
}

export const Default: Story = {
  render: args => <WateringCardDemo {...args} />,
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  frame: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    width: '100%',
  },
  stack: {
    flex: 1,
    width: '100%',
  },
  topRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
    width: '100%',
  },
});
