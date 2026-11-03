import type { Meta, StoryObj } from '@storybook/svelte';
import { enDict, frDict, htmlSnippet, matrixCells, renderMatrix } from '@core/stories/storyHelpers';
import Tile from './Tile.svelte';

const defaultSnippet = htmlSnippet(
  `<p style="margin:0">${frDict.designSystem.principles[1].text}</p>`,
);

const meta = {
  component: Tile,
  tags: ['autodocs'],
  args: {
    label: '01 · Core Principle',
    title: frDict.designSystem.principles[1].label,
    accent: 'primary',
    interactive: false,
    flush: false,
    children: defaultSnippet,
  },
  parameters: {
    localizedArgs: {
      fr: {
        label: 'Principe 01',
        title: frDict.designSystem.principles[1].label,
        children: htmlSnippet(`<p style="margin:0">${frDict.designSystem.principles[1].text}</p>`),
      },
      en: {
        label: 'Principle 01',
        title: enDict.designSystem.principles[1].label,
        children: htmlSnippet(`<p style="margin:0">${enDict.designSystem.principles[1].text}</p>`),
      },
    },
    docs: {
      source: {
        code: `<Tile label="Principle 01" title="Tokens as the single source of truth" accent="primary">
  <p>All colors, shadows, easing curves, and fluid clamp() typographic scales come exclusively from tokens.css.</p>
</Tile>`,
      },
    },
  },
  argTypes: {
    accent: {
      control: 'select',
      options: ['none', 'primary', 'violet', 'mint', 'blue', 'amber'],
    },
    children: { control: false },
  },
} satisfies Meta<typeof Tile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AccentMatrix: Story = {
  render: renderMatrix({
    minWidth: '16rem',
    cells: matrixCells(Tile, [
      {
        caption: 'accent="primary"',
        props: {
          label: 'core/',
          title: 'Foundation',
          accent: 'primary',
          children: htmlSnippet(
            '<p style="margin:0">Tokens, motion orchestrator, i18n, and grain.</p>',
          ),
        },
      },
      {
        caption: 'accent="blue"',
        props: {
          label: 'ui/',
          title: 'Atomic Primitives',
          accent: 'blue',
          children: htmlSnippet(
            '<p style="margin:0">10 stateless, accessible Svelte 5 primitives.</p>',
          ),
        },
      },
      {
        caption: 'accent="mint"',
        props: {
          label: 'blocks/',
          title: 'Composition Blocks',
          accent: 'mint',
          children: htmlSnippet('<p style="margin:0">8 reusable editorial layout structures.</p>'),
        },
      },
      {
        caption: 'accent="amber"',
        props: {
          label: 'domains/',
          title: 'Vertical Slices',
          accent: 'amber',
          children: htmlSnippet(
            '<p style="margin:0">Isolated business domains (work, about, navigation).</p>',
          ),
        },
      },
      {
        caption: 'accent="violet" · interactive',
        props: {
          label: 'Hover State',
          title: 'Interactive Elevation',
          accent: 'violet',
          interactive: true,
          children: htmlSnippet(
            '<p style="margin:0">Subtle border glow and shadow lift on hover.</p>',
          ),
        },
      },
      {
        caption: 'accent="none"',
        props: {
          label: 'Neutral',
          title: 'Glass Surface',
          accent: 'none',
          children: htmlSnippet(
            '<p style="margin:0">Default translucent surface on dark and raised bands.</p>',
          ),
        },
      },
    ]),
  }),
};

export const InteractiveSurface: Story = {
  args: {
    interactive: true,
    accent: 'violet',
  },
};
