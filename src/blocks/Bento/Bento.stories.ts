import type { Meta, StoryObj } from '@storybook/svelte';
import Bento from './Bento.svelte';

const meta = {
  component: Bento,
  tags: ['autodocs'],
  args: {
    items: [
      {
        label: 'Principe',
        title: 'Flux unidirectionnel',
        text: 'core → ui → blocks → domains → layouts → pages.',
        accent: 'primary',
        span: 2,
      },
      {
        label: 'Principe',
        title: 'Tokens = SSOT',
        text: 'Zéro valeur en dur dans les composants.',
        accent: 'violet',
        span: 1,
      },
      {
        label: 'Principe',
        title: 'Routes minces',
        text: 'Les pages ne sont que du routage.',
        accent: 'mint',
        span: 1,
      },
      {
        label: 'Principe',
        title: 'Mobile-first',
        text: 'Ajustements desktop à partir de 768 px.',
        accent: 'blue',
        span: 2,
      },
    ],
  },
} satisfies Meta<typeof Bento>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
