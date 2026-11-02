import type { Meta, StoryObj } from '@storybook/svelte';
import CaseInsight from './CaseInsight.svelte';

const meta = {
  component: CaseInsight,
  tags: ['autodocs'],
  args: {
    insight: {
      role: 'Product Designer · System Designer · Lead Dev',
      problem:
        'Les animations GSAP d’introduction se lançaient derrière la pop-in légale de consentement : l’utilisateur découvrait une page déjà figée ou pouvait scroller pendant l’intro.',
      decision:
        'Isoler le moteur de mouvement dans HeaderCusAnimation et créer un orchestrateur global à deux timelines (loadedTimeline → readyTimeline).',
      resolution:
        'Zéro animation perdue derrière le consentement, verrouillage automatique du scroll pendant l’intro et configuration 100 % déclarative via :animations="{ intro, scroll }".',
    },
  },
} satisfies Meta<typeof CaseInsight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
