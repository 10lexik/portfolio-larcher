import type { Meta, StoryObj } from '@storybook/svelte';
import { enDict, frDict } from '@core/stories/storyHelpers';
import Quote from './Quote.svelte';

const meta = {
  component: Quote,
  tags: ['autodocs'],
  args: {
    text: frDict.about.philosophy.text,
    cite: frDict.about.philosophy.cite,
  },
  parameters: {
    localizedArgs: {
      fr: {
        text: frDict.about.philosophy.text,
        cite: frDict.about.philosophy.cite,
      },
      en: {
        text: enDict.about.philosophy.text,
        cite: enDict.about.philosophy.cite,
      },
    },
  },
} satisfies Meta<typeof Quote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EditorialQuote: Story = {};

export const WithoutCitation: Story = {
  args: {
    text: frDict.veepee.quoteText,
    cite: undefined,
  },
  parameters: {
    localizedArgs: {
      fr: { text: frDict.veepee.quoteText },
      en: { text: enDict.veepee.quoteText },
    },
  },
};
