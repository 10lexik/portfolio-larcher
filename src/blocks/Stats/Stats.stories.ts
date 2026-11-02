import type { Meta, StoryObj } from '@storybook/svelte';
import Stats from './Stats.svelte';

const meta = {
  component: Stats,
  tags: ['autodocs'],
  args: {
    items: [
      { value: 300, prefix: '+', label: 'opérations de marque' },
      { value: 10, prefix: '+', label: 'marchés européens' },
      {
        value: 50,
        display: '30–50 %',
        label: 'de temps de production en moins',
        note: 'Estimation interne',
      },
      { value: 50, prefix: '+', label: 'collaborateurs' },
    ],
  },
} satisfies Meta<typeof Stats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
