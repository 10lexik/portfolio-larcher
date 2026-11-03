import type { Meta, StoryObj } from '@storybook/svelte';
import { matrixCells, renderMatrix } from '@core/stories/storyHelpers';
import Divider from './Divider.svelte';

const meta = {
  component: Divider,
  tags: ['autodocs'],
  args: {
    size: 'medium',
    showLine: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'huge'],
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLine: Story = {};

export const VerticalSpacer: Story = {
  args: {
    showLine: false,
    size: 'large',
  },
};

export const AllSpacings: Story = {
  render: renderMatrix({
    stack: true,
    cells: matrixCells(Divider, [
      { caption: 'size="small" · showLine', props: { size: 'small', showLine: true } },
      { caption: 'size="medium" · showLine', props: { size: 'medium', showLine: true } },
      { caption: 'size="large" · showLine', props: { size: 'large', showLine: true } },
      { caption: 'size="huge" · showLine', props: { size: 'huge', showLine: true } },
    ]),
  }),
};
