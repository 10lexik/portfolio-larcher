import type { Meta, StoryObj } from '@storybook/svelte';
import { getDesignSystemContent } from '@domains/work/designSystem';
import { getVeepeeContent } from '@domains/work/veepee';
import ComponentTree from './ComponentTree.svelte';

const veepeeFr = getVeepeeContent('fr');
const veepeeEn = getVeepeeContent('en');
const dsFr = getDesignSystemContent('fr');
const dsEn = getDesignSystemContent('en');

const meta = {
  component: ComponentTree,
  tags: ['autodocs'],
  args: {
    label: veepeeFr.labels.treeLabel,
    root: veepeeFr.componentTreeRoot,
    nodes: veepeeFr.componentTree,
  },
  parameters: {
    localizedArgs: {
      fr: {
        label: veepeeFr.labels.treeLabel,
        nodes: veepeeFr.componentTree,
      },
      en: {
        label: veepeeEn.labels.treeLabel,
        nodes: veepeeEn.componentTree,
      },
    },
  },
} satisfies Meta<typeof ComponentTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FeaturedSubtree: Story = {};

export const SixLayerPillars: Story = {
  args: {
    label: dsFr.labels.treeLabel,
    root: dsFr.srcTreeRoot,
    nodes: dsFr.srcTree,
  },
  parameters: {
    localizedArgs: {
      fr: { label: dsFr.labels.treeLabel, nodes: dsFr.srcTree },
      en: { label: dsEn.labels.treeLabel, nodes: dsEn.srcTree },
    },
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    root: dsFr.srcTreeRoot,
    nodes: dsFr.srcTree,
  },
};
