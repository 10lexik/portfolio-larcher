import type { Meta, StoryObj } from '@storybook/svelte';
import Footer from './Footer.svelte';

const meta = {
  title: 'Navigation/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    year: 2026,
  },
  argTypes: {
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GlobalFooter: Story = {};

export const EnglishColophon: Story = {
  args: {
    locale: 'en',
  },
};
