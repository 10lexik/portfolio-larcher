import type { Meta, StoryObj } from '@storybook/svelte';
import { enDict, frDict, matrixCells, renderMatrix } from '@core/stories/storyHelpers';
import Badge from './Badge.svelte';

const meta = {
  component: Badge,
  tags: ['autodocs'],
  args: {
    label: frDict.designSystem.hero.badges[0],
    variant: 'primary',
    size: 'md',
  },
  parameters: {
    localizedArgs: {
      fr: { label: frDict.designSystem.hero.badges[0] },
      en: { label: enDict.designSystem.hero.badges[0] },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'dark', 'gray', 'light', 'outline'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: renderMatrix({
    minWidth: '12rem',
    cells: matrixCells(Badge, [
      {
        caption: 'primary · lg',
        props: { label: 'Design System', variant: 'primary', size: 'lg' },
      },
      { caption: 'dark · md', props: { label: 'Svelte 5 Runes', variant: 'dark', size: 'md' } },
      { caption: 'gray · md', props: { label: 'Tailwind CSS 4', variant: 'gray', size: 'md' } },
      { caption: 'light · md', props: { label: 'WCAG 2.1 AA', variant: 'light', size: 'md' } },
      {
        caption: 'outline · sm',
        props: { label: 'Reconstitution', variant: 'outline', size: 'sm' },
      },
      {
        caption: 'href (interactive link)',
        props: {
          label: 'Case Study 02 →',
          variant: 'primary',
          size: 'sm',
          href: '/design-system',
        },
      },
    ]),
  }),
};

export const LinkedBadge: Story = {
  args: {
    label: 'Storybook 10',
    href: '/storybook/index.html',
    variant: 'outline',
    size: 'md',
  },
};
