import type { Meta, StoryObj } from '@storybook/svelte';
import { getDesignSystemContent } from '@domains/work/designSystem';
import Timeline from './Timeline.svelte';

const dsFr = getDesignSystemContent('fr');
const dsEn = getDesignSystemContent('en');

const meta = {
  component: Timeline,
  tags: ['autodocs'],
  args: {
    steps: dsFr.steps,
  },
  parameters: {
    localizedArgs: {
      fr: { steps: dsFr.steps },
      en: { steps: dsEn.steps },
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UnidirectionalLayerFlow: Story = {};
