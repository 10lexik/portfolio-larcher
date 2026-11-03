import type { Meta, StoryObj } from '@storybook/svelte';
import Foundations from './Foundations.svelte';

const meta = {
  title: 'Design Tokens',
  component: Foundations,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['colors', 'typography', 'spacing', 'motion'],
    },
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
} satisfies Meta<typeof Foundations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorsAndContrast: Story = {
  args: { mode: 'colors' },
};

export const FluidTypography: Story = {
  args: { mode: 'typography' },
};

export const SpacingAndElevation: Story = {
  args: { mode: 'spacing' },
};

export const MotionAndPrintGrain: Story = {
  args: { mode: 'motion' },
};
