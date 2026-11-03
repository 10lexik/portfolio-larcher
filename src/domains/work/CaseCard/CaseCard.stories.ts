import type { Meta, StoryObj } from '@storybook/svelte';
import { getHomeContent } from '@core/content/site';
import CaseCard from './CaseCard.svelte';

const homeFr = getHomeContent('fr');
const homeEn = getHomeContent('en');

const meta = {
  title: 'Work/CaseCard',
  component: CaseCard,
  tags: ['autodocs'],
  args: {
    eyebrow: homeFr.designSystem.cardEyebrow,
    title: homeFr.designSystem.cardTitle,
    text: homeFr.designSystem.cardText,
    href: homeFr.designSystem.cardHref,
    cta: homeFr.designSystem.cardCta,
    chips: homeFr.designSystem.cardChips,
    featured: false,
  },
  parameters: {
    localizedArgs: {
      fr: {
        eyebrow: homeFr.designSystem.cardEyebrow,
        title: homeFr.designSystem.cardTitle,
        text: homeFr.designSystem.cardText,
        href: homeFr.designSystem.cardHref,
        cta: homeFr.designSystem.cardCta,
      },
      en: {
        eyebrow: homeEn.designSystem.cardEyebrow,
        title: homeEn.designSystem.cardTitle,
        text: homeEn.designSystem.cardText,
        href: homeEn.designSystem.cardHref,
        cta: homeEn.designSystem.cardCta,
      },
    },
  },
} satisfies Meta<typeof CaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EditorialSummaryCard: Story = {};

export const FeaturedWithMedia: Story = {
  args: {
    featured: true,
    image: '/media/boards/design-to-code.webp',
    imageAlt: 'Pipeline Figma vers composants typés',
  },
  parameters: {
    localizedArgs: {
      fr: {
        eyebrow: homeFr.designSystem.cardEyebrow,
        title: homeFr.designSystem.cardTitle,
        text: homeFr.designSystem.cardText,
        cta: homeFr.designSystem.cardCta,
        imageAlt: 'Pipeline Figma vers composants typés',
      },
      en: {
        eyebrow: homeEn.designSystem.cardEyebrow,
        title: homeEn.designSystem.cardTitle,
        text: homeEn.designSystem.cardText,
        cta: homeEn.designSystem.cardCta,
        imageAlt: 'Figma-to-code typed component pipeline',
      },
    },
  },
};
