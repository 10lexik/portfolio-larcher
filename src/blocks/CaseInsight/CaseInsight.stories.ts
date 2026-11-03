import type { Meta, StoryObj } from '@storybook/svelte';
import { enDict, frDict } from '@core/stories/storyHelpers';
import CaseInsight from './CaseInsight.svelte';

const meta = {
  component: CaseInsight,
  tags: ['autodocs'],
  args: {
    insight: frDict.designSystem.insights.architecture,
  },
  parameters: {
    localizedArgs: {
      fr: { insight: frDict.designSystem.insights.architecture },
      en: { insight: enDict.designSystem.insights.architecture },
    },
  },
  argTypes: {
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
} satisfies Meta<typeof CaseInsight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRoleHeader: Story = {};

export const WithoutRoleBadge: Story = {
  args: {
    insight: {
      problem: frDict.designSystem.insights.principes.problem,
      decision: frDict.designSystem.insights.principes.decision,
      resolution: frDict.designSystem.insights.principes.resolution,
    },
  },
  parameters: {
    localizedArgs: {
      fr: {
        insight: {
          problem: frDict.designSystem.insights.principes.problem,
          decision: frDict.designSystem.insights.principes.decision,
          resolution: frDict.designSystem.insights.principes.resolution,
        },
      },
      en: {
        insight: {
          problem: enDict.designSystem.insights.principes.problem,
          decision: enDict.designSystem.insights.principes.decision,
          resolution: enDict.designSystem.insights.principes.resolution,
        },
      },
    },
  },
};
