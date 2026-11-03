import type { Meta, StoryObj } from '@storybook/svelte';
import { enDict, frDict, htmlSnippet } from '@core/stories/storyHelpers';
import SectionHead from './SectionHead.svelte';

const meta = {
  component: SectionHead,
  tags: ['autodocs'],
  args: {
    eyebrow: frDict.designSystem.sections.gardefous.eyebrow,
    title: frDict.designSystem.sections.gardefous.title,
    lead: frDict.designSystem.sections.gardefous.lead,
    as: 'h2',
  },
  parameters: {
    localizedArgs: {
      fr: {
        eyebrow: frDict.designSystem.sections.gardefous.eyebrow,
        title: frDict.designSystem.sections.gardefous.title,
        lead: frDict.designSystem.sections.gardefous.lead,
      },
      en: {
        eyebrow: enDict.designSystem.sections.gardefous.eyebrow,
        title: enDict.designSystem.sections.gardefous.title,
        lead: enDict.designSystem.sections.gardefous.lead,
      },
    },
  },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['h1', 'h2', 'h3'],
    },
    titleSlot: { control: false },
  },
} satisfies Meta<typeof SectionHead>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompleteHeader: Story = {};

export const CompactWithoutLead: Story = {
  args: {
    eyebrow: frDict.designSystem.sections.principes.eyebrow,
    title: frDict.designSystem.sections.principes.title,
    lead: undefined,
  },
  parameters: {
    localizedArgs: {
      fr: {
        eyebrow: frDict.designSystem.sections.principes.eyebrow,
        title: frDict.designSystem.sections.principes.title,
      },
      en: {
        eyebrow: enDict.designSystem.sections.principes.eyebrow,
        title: enDict.designSystem.sections.principes.title,
      },
    },
  },
};

export const WithGradientEmphasis: Story = {
  args: {
    eyebrow: '02 · Architecture',
    title: 'Six couches à dépendance strictement unidirectionnelle',
    titleSlot: htmlSnippet(
      '<span>Six couches à dépendance <em>strictement unidirectionnelle</em></span>',
    ),
  },
};

