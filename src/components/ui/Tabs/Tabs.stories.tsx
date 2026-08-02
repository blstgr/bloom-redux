import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';

import { FAVORITES_TABS } from '../../../features/plants/data/favoritesTabs';

import { Tabs, type TabItem } from './Tabs';

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
  render: () => <InteractiveTabs initialKey="all" tabs={FAVORITES_TABS} />,
};
