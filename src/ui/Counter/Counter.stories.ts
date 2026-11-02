import type { Meta, StoryObj } from '@storybook/svelte';
import Counter from './Counter.svelte';

const meta = {
  component: Counter,
  tags: ['autodocs'],
  args: { value: 300, prefix: '+', suffix: '' },
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Operations: Story = {};
export const Percent: Story = { args: { value: 50, prefix: '', suffix: ' %' } };
export const Slow: Story = { args: { value: 10, prefix: '+', duration: 3000 } };
