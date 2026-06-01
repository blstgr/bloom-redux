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

export const A_All: Story = {
  name: 'All',
  args: {} as never,
  render: () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.stack}>
        <View style={styles.block}>
          <SettingsPanel
            rows={[
              { variant: 'text', value: 'plantkiller@gmail.com' },
              { variant: 'text', value: '*******', secure: true },
            ]}
          />
        </View>
        <View style={styles.block}>
          <SettingsPanel
            rows={[
              { variant: 'textWithLabel', label: 'Email', value: 'plantkiller@gmail.com' },
              { variant: 'textWithLabel', label: 'Password', value: '*****', secure: true },
            ]}
          />
        </View>
        <View style={styles.block}>
          <SettingsPanel
            rows={[
              {
                variant: 'textWithLabelAndButton',
                label: 'Email',
                value: 'plantkiller@gmail.com',
                buttonLabel: 'Edit',
                editable: true,
              },
              {
                variant: 'textWithLabelAndButton',
                label: 'Password',
                value: '*****',
                secure: true,
                buttonLabel: 'Reset',
                editable: true,
              },
              {
                variant: 'textWithLabelAndButton',
                label: 'AI',
                value: 'deepseek-reasoner / \u2022\u202260ff',
                buttonLabel: 'Edit',
                editable: true,
                editFields: [
                  { label: 'AI model', placeholder: 'New password', value: '' },
                  { label: 'API key', placeholder: 'New password', value: '' },
                ],
              },
            ]}
          />
        </View>
      </View>
    </ScrollView>
  ),
};

export const B_Text: Story = {
  name: 'Text',
  args: {
    rows: [{ variant: 'text', value: 'plantkiller@gmail.com' }],
  },
};

export const C_TextWithLabel: Story = {
  name: 'Text+label',
  args: {
    rows: [{ variant: 'textWithLabel', label: 'Email', value: 'plantkiller@gmail.com' }],
  },
};

export const D_TextWithLabelAndButton: Story = {
  name: 'Text+label+button',
  args: {
    rows: [
      {
        variant: 'textWithLabelAndButton',
        label: 'Email',
        value: 'plantkiller@gmail.com',
        buttonLabel: 'Edit',
        editable: true,
      },
      {
        variant: 'textWithLabelAndButton',
        label: 'Password',
        value: '*****',
        secure: true,
        buttonLabel: 'Reset',
        editable: true,
      },
      {
        variant: 'textWithLabelAndButton',
        label: 'AI',
        value: 'deepseek-reasoner / \u2022\u202260ff',
        buttonLabel: 'Edit',
        editable: true,
        editFields: [
          { label: 'AI model', placeholder: 'New password', value: '' },
          { label: 'API key', placeholder: 'New password', value: '' },
        ],
      },
    ],
  },
};

export const E_ButtonOnly: Story = {
  name: 'Button only',
  args: {
    rows: [{ variant: 'buttonOnly', buttonLabel: 'Log out' }],
  },
};

const styles = StyleSheet.create({
  block: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: spacing.md,
    width: '100%',
  },
  stack: {
    gap: 20,
    width: '100%',
  },
});
