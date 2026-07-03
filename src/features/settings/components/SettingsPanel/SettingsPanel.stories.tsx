import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { spacing } from '../../../../theme';

import { SettingsPanel } from './SettingsPanel';

const meta = {
  title: 'Spec/SettingsPanel',
  component: SettingsPanel,
} satisfies Meta<typeof SettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

function maskKey(key: string) {
  return '•'.repeat(Math.max(0, key.length - 4)) + key.slice(-4);
}

// — Stateful wrappers —

function TextPanel() {
  return (
    <SettingsPanel
      rows={[
        { variant: 'text', value: 'plantkiller@gmail.com' },
        { variant: 'text', value: 'hunter2abc', secure: true },
      ]}
    />
  );
}

function WithLabelPanel() {
  return (
    <SettingsPanel
      rows={[
        { variant: 'textWithLabel', label: 'Email', value: 'plantkiller@gmail.com' },
        { variant: 'textWithLabel', label: 'Password', value: 'hunter2abc', secure: true },
      ]}
    />
  );
}

function EditablePanel() {
  const [email, setEmail] = React.useState('plantkiller@gmail.com');
  const [password, setPassword] = React.useState('hunter2abc');
  return (
    <SettingsPanel
      rows={[
        {
          variant: 'textWithLabelAndButton',
          label: 'Email',
          value: email,
          buttonLabel: 'Edit',
          editable: true,
          onSave: setEmail,
        },
        {
          variant: 'textWithLabelAndButton',
          label: 'Password',
          value: password,
          secure: true,
          buttonLabel: 'Reset',
          editable: true,
          onSave: setPassword,
        },
      ]}
    />
  );
}

function MultipleInputsPanel() {
  const [model, setModel] = React.useState('deepseek-reasoner');
  const [apiKey, setApiKey] = React.useState('sk-a1b2c3d4e5f6a1b2c3d4e5f6');
  return (
    <SettingsPanel
      rows={[
        {
          variant: 'textWithLabelAndButton',
          label: 'AI',
          value: `${model} / ${maskKey(apiKey)}`,
          buttonLabel: 'Edit',
          editable: true,
          editFields: [
            { label: 'AI model', value: model, placeholder: 'e.g. deepseek-reasoner', type: 'text' },
            { label: 'API key', value: apiKey, placeholder: 'sk-...', type: 'password' },
          ],
          onSaveFields: ([newModel, newKey]) => {
            setModel(newModel);
            setApiKey(newKey);
          },
        },
      ]}
    />
  );
}

function WithActionPanel() {
  const [email, setEmail] = React.useState('plantkiller@gmail.com');
  return (
    <SettingsPanel
      rows={[
        {
          variant: 'textWithLabelAndButton',
          label: 'Email',
          value: email,
          buttonLabel: 'Edit',
          editable: true,
          onSave: setEmail,
        },
        { variant: 'buttonOnly', buttonLabel: 'Log out' },
      ]}
    />
  );
}

// — Stories —

export const _01_All: Story = {
  name: 'All',
  args: {} as never,
  render: () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.stack}>
        <TextPanel />
        <WithLabelPanel />
        <EditablePanel />
        <MultipleInputsPanel />
        <WithActionPanel />
      </View>
    </ScrollView>
  ),
};

export const _02_Text: Story = {
  name: 'Text',
  args: {} as never,
  render: () => <TextPanel />,
};

export const _03_WithLabel: Story = {
  name: 'With Label',
  args: {} as never,
  render: () => <WithLabelPanel />,
};

export const _04_Editable: Story = {
  name: 'Editable',
  args: {} as never,
  render: () => <EditablePanel />,
};

export const _05_MultipleInputs: Story = {
  name: 'With Multiple Inputs',
  args: {} as never,
  render: () => <MultipleInputsPanel />,
};

export const _06_WithAction: Story = {
  name: 'With Action',
  args: {} as never,
  render: () => <WithActionPanel />,
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.md,
    width: '100%',
  },
  stack: {
    gap: spacing.lg,
    width: '100%',
  },
});
