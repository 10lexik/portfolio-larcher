import type { Meta, StoryObj } from '@storybook/svelte';
import Timeline from './Timeline.svelte';

const meta = {
  component: Timeline,
  tags: ['autodocs'],
  args: {
    steps: [
      { title: 'core', text: 'Socle technique : tokens, styles, utilitaires.', accent: 'primary' },
      { title: 'ui', text: 'Primitives atomiques réutilisables.', accent: 'blue' },
      { title: 'blocks', text: 'Blocs éditoriaux génériques.', accent: 'mint' },
      { title: 'domains', text: 'Tranches verticales métier.', accent: 'amber' },
    ],
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
