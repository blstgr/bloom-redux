import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';

import { Tabs, type TabItem } from './Tabs';

// The design system does not depend on any feature. This story previously imported
// FAVORITES_TABS from features/plants, inverting the ui <- features direction so a change to
// Favorites' tab vocabulary could break a Tabs story. Its own fixture keeps Tabs demonstrable on
// its own terms; favs-spec.md, not this file, is where the real tab labels are specified.
const DEMO_TABS: TabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'easy', label: 'Easy Peasy' },
  { key: 'manageable', label: 'Somewhat Needy' },
  { key: 'diva', label: 'High-Maintenance' },
];

function InteractiveTabs({ initialKey, tabs }: { initialKey: string; tabs: TabItem[] }) {
  const [activeKey, setActiveKey] = React.useState(initialKey);
  return <Tabs activeKey={activeKey} onTabPress={setActiveKey} tabs={tabs} />;
}

const meta = {
  title: 'Spec/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: {} as never,
  render: () => <InteractiveTabs initialKey="all" tabs={DEMO_TABS} />,
};
