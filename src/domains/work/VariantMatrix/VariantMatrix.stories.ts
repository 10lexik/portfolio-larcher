import type { Meta, StoryObj } from '@storybook/svelte';
import VariantMatrix from './VariantMatrix.svelte';

const meta = {
  title: 'Work/VariantMatrix',
  component: VariantMatrix,
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
} satisfies Meta<typeof VariantMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderCusVariants: Story = {};

export const EnglishCatalog: Story = {
  args: {
    locale: 'en',
  },
};

