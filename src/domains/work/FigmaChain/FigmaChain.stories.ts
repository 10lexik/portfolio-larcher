import type { Meta, StoryObj } from '@storybook/svelte';
import FigmaChain from './FigmaChain.svelte';

const meta = {
  title: 'Work/FigmaChain',
  component: FigmaChain,
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
} satisfies Meta<typeof FigmaChain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesignToCodePipeline: Story = {};

export const EnglishPipeline: Story = {
  args: {
    locale: 'en',
  },
};

