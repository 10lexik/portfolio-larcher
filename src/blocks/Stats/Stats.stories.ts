import type { Meta, StoryObj } from '@storybook/svelte';
import { getDesignSystemContent } from '@domains/work/designSystem';
import { getVeepeeContent } from '@domains/work/veepee';
import Stats from './Stats.svelte';

const veepeeFr = getVeepeeContent('fr');
const veepeeEn = getVeepeeContent('en');
const dsFr = getDesignSystemContent('fr');
const dsEn = getDesignSystemContent('en');

const meta = {
  component: Stats,
  tags: ['autodocs'],
  args: {
    items: veepeeFr.kpis,
  },
  parameters: {
    localizedArgs: {
      fr: { items: veepeeFr.kpis },
      en: { items: veepeeEn.kpis },
    },
  },
} satisfies Meta<typeof Stats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VeepeeProductionMetrics: Story = {};

export const DesignSystemMetrics: Story = {
  args: {
    items: dsFr.kpis,
  },
  parameters: {
    localizedArgs: {
      fr: { items: dsFr.kpis },
      en: { items: dsEn.kpis },
    },
  },
};
