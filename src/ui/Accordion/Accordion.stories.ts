import type { Meta, StoryObj } from '@storybook/svelte';
import Accordion from './Accordion.svelte';

const meta = {
  component: Accordion,
  tags: ['autodocs'],
  args: {
    exclusive: true,
    openIndex: 0,
    items: [
      {
        title: 'Pourquoi des tokens en source unique ?',
        content: 'Changer de charte graphique revient à modifier un seul fichier.',
      },
      {
        title: 'Pourquoi des domaines isolés ?',
        content: 'Chaque domaine évolue et se supprime sans toucher aux autres.',
      },
      {
        title: 'Comment tenir les règles ?',
        content: 'Elles sont vérifiées par une chaîne de contrôles automatisés.',
      },
    ],
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Exclusive: Story = {};
export const Multiple: Story = { args: { exclusive: false, openIndex: -1 } };
