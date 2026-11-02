import type { Meta, StoryObj } from '@storybook/svelte';
import Heading from './Heading.svelte';

const meta = {
  component: Heading,
  tags: ['autodocs'],
  args: { text: 'Un design system, des identités de marque', as: 'h2', variant: 'h2' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['hero', 'title', 'h1', 'h2', 'h3', 'h4', 'lead', 'quote', 'label', 'body'],
    },
    tone: { control: 'select', options: ['default', 'muted', 'accent', 'gradient', 'inverse'] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Gradient: Story = { args: { tone: 'gradient', variant: 'h1', as: 'h1' } };
export const Lead: Story = {
  args: { variant: 'lead', as: 'p', text: 'Une phrase d’introduction, plus douce que le titre.' },
};
export const Label: Story = { args: { variant: 'label', as: 'p', text: 'Case Study 01' } };
