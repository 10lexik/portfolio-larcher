import type { Meta, StoryObj } from '@storybook/svelte';
import Badge from './Badge.svelte';

const meta = {
  component: Badge,
  tags: ['autodocs'],
  args: { label: 'Design System', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'dark', 'light', 'gray', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Dark: Story = { args: { variant: 'dark' } };
export const Light: Story = { args: { variant: 'light' } };
export const Gray: Story = { args: { variant: 'gray' } };
export const Reconstruction: Story = {
  args: { variant: 'outline', label: 'Reconstitution', size: 'sm' },
};
