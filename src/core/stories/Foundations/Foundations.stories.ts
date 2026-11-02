import type { Meta, StoryObj } from '@storybook/svelte';
import Foundations from './Foundations.svelte';

const meta = {
  component: Foundations,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['colors', 'typography', 'spacing'] },
  },
} satisfies Meta<typeof Foundations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = { args: { mode: 'colors' } };
export const FluidTypography: Story = { args: { mode: 'typography' } };
export const SpacingAndRadii: Story = { args: { mode: 'spacing' } };
