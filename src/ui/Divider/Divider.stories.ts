import type { Meta, StoryObj } from '@storybook/svelte';
import Divider from './Divider.svelte';

const meta = {
  component: Divider,
  tags: ['autodocs'],
  args: { size: 'medium', showLine: true },
  argTypes: { size: { control: 'select', options: ['small', 'medium', 'large', 'huge'] } },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLine: Story = {};
export const Spacer: Story = { args: { showLine: false, size: 'large' } };
