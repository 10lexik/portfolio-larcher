import type { Meta, StoryObj } from '@storybook/svelte';
import { expect, within } from 'storybook/test';
import Counter from './Counter.svelte';

const meta = {
  component: Counter,
  tags: ['autodocs'],
  args: {
    value: 300,
    prefix: '+',
    suffix: '',
    duration: 1400,
  },
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandCampaigns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('+300')).toBeInTheDocument();
  },
};

export const PercentageGain: Story = {
  args: {
    value: 50,
    prefix: '',
    suffix: ' %',
  },
};

export const SlowCadence: Story = {
  args: {
    value: 13,
    prefix: '',
    suffix: ' markets',
    duration: 2600,
  },
};
