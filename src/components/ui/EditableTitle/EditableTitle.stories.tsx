import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';

import { EditableTitle } from './EditableTitle';

const meta = {
  title: 'Spec/EditableTitle',
  component: EditableTitle,
} satisfies Meta<typeof EditableTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

function EditableTitleWithState() {
  const [value, setValue] = React.useState('ZZ plant');
  return (
    <EditableTitle
      value={value}
      onSubmit={next => {
        setValue(next);
        return true;
      }}
    />
  );
}

export const Default: Story = {
  args: {
    value: 'ZZ plant',
    onSubmit: () => true,
  },
  render: () => <EditableTitleWithState />,
};
