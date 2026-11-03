import type { Meta, StoryObj } from '@storybook/svelte';
import { enDict, frDict, matrixCells, renderMatrix } from '@core/stories/storyHelpers';
import Heading from './Heading.svelte';

const meta = {
  component: Heading,
  tags: ['autodocs'],
  args: {
    text: frDict.designSystem.sections.architecture.title,
    as: 'h2',
    variant: 'h2',
    tone: 'default',
  },
  parameters: {
    localizedArgs: {
      fr: { text: frDict.designSystem.sections.architecture.title },
      en: { text: enDict.designSystem.sections.architecture.title },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'p', 'span'],
    },
    variant: {
      control: 'select',
      options: ['hero', 'title', 'h1', 'h2', 'h3', 'h4', 'lead', 'quote', 'label', 'body'],
    },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'accent', 'gradient', 'inverse'],
    },
    splitTone: {
      control: 'select',
      options: [false, true, 'badge', 'accent'],
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TypeScaleMatrix: Story = {
  render: renderMatrix({
    stack: true,
    cells: matrixCells(Heading, [
      {
        caption: 'variant="hero" · as="h1"',
        props: { as: 'h1', variant: 'hero', text: 'Design System Architecture' },
      },
      {
        caption: 'variant="h1" · tone="gradient"',
        props: { as: 'h2', variant: 'h1', tone: 'gradient', text: 'Six unidirectional layers' },
      },
      {
        caption: 'variant="h2"',
        props: { as: 'h2', variant: 'h2', text: 'Single-source @theme tokens' },
      },
      {
        caption: 'variant="h3"',
        props: { as: 'h3', variant: 'h3', text: 'Co-located Svelte 5 components' },
      },
      {
        caption: 'variant="lead" · tone="muted"',
        props: {
          as: 'p',
          variant: 'lead',
          tone: 'muted',
          text: 'Fluid clamp() typography calibrated from 375px mobile up to 1440px desktop.',
        },
      },
      {
        caption: 'variant="label" · tone="accent"',
        props: { as: 'p', variant: 'label', tone: 'accent', text: 'Case Study 02 · Governance' },
      },
    ]),
  }),
};

export const SplitBadgeTone: Story = {
  args: {
    as: 'h2',
    variant: 'h2',
    splitTone: 'badge',
    text: 'Règle 01 : Zéro valeur magique hors de tokens.css',
  },
  parameters: {
    localizedArgs: {
      fr: { text: 'Règle 01 : Zéro valeur magique hors de tokens.css' },
      en: { text: 'Rule 01: Zero hardcoded values outside tokens.css' },
    },
  },
};
