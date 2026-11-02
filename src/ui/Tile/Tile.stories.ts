import type { Meta, StoryObj } from '@storybook/svelte';
import Tile from './Tile.svelte';

const meta = {
  component: Tile,
  tags: ['autodocs'],
  args: { label: 'Règle 1', title: 'Pas de composant sans Readme.md', accent: 'primary' },
  argTypes: {
    accent: { control: 'select', options: ['none', 'primary', 'violet', 'mint', 'blue', 'amber'] },
  },
} satisfies Meta<typeof Tile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Violet: Story = { args: { accent: 'violet', label: 'Règle 2' } };
export const Mint: Story = { args: { accent: 'mint', label: 'Règle 3' } };
export const Interactive: Story = { args: { interactive: true, accent: 'none' } };
