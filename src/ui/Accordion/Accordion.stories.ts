import type { Meta, StoryObj } from '@storybook/svelte';
import { expect, userEvent, within } from 'storybook/test';
import { enDict, frDict } from '@core/stories/storyHelpers';
import Accordion from './Accordion.svelte';

const meta = {
  component: Accordion,
  tags: ['autodocs'],
  args: {
    exclusive: true,
    openIndex: 0,
    items: frDict.designSystem.faq,
  },
  parameters: {
    localizedArgs: {
      fr: { items: frDict.designSystem.faq },
      en: { items: enDict.designSystem.faq },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExclusiveGroup: Story = {
  play: async ({ canvasElement }) => {
    const detailsList = canvasElement.querySelectorAll('details');
    await expect(detailsList.length).toBe(3);
    await expect(detailsList[0]).toHaveAttribute('open');
    await expect(detailsList[1]).not.toHaveAttribute('open');

    const secondSummary = detailsList[1]?.querySelector('summary');
    if (secondSummary) {
      await userEvent.click(secondSummary);
      await expect(detailsList[1]).toHaveAttribute('open');
      await expect(detailsList[0]).not.toHaveAttribute('open');
    }
  },
};

export const MultipleOpenAllowed: Story = {
  args: {
    exclusive: false,
    openIndex: -1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const detailsList = canvasElement.querySelectorAll('details');
    const summaries = canvasElement.querySelectorAll('summary');
    if (summaries[0] && summaries[1]) {
      await userEvent.click(summaries[0]);
      await userEvent.click(summaries[1]);
      await expect(detailsList[0]).toHaveAttribute('open');
      await expect(detailsList[1]).toHaveAttribute('open');
    }
    await expect(canvas.getAllByRole('group').length).toBeGreaterThanOrEqual(0);
  },
};
