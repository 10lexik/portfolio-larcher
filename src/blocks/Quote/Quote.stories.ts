import type { Meta, StoryObj } from '@storybook/svelte';
import Quote from './Quote.svelte';

const meta = {
  component: Quote,
  tags: ['autodocs'],
  args: {
    text: 'Produire plus vite, avec une qualité constante, sans brider la créativité de chaque marque.',
    cite: 'L’enjeu',
  },
} satisfies Meta<typeof Quote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutCite: Story = { args: { cite: undefined } };
