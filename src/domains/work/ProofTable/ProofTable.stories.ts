import type { Meta, StoryObj } from '@storybook/svelte';
import { expect, within } from 'storybook/test';
import { getVeepeeContent } from '../veepee';
import ProofTable from './ProofTable.svelte';

const veepeeFr = getVeepeeContent('fr');
const veepeeEn = getVeepeeContent('en');

const meta = {
  title: 'Work/ProofTable',
  component: ProofTable,
  tags: ['autodocs'],
  args: {
    proofs: veepeeFr.proofs.slice(0, 6),
  },
  parameters: {
    localizedArgs: {
      fr: { proofs: veepeeFr.proofs.slice(0, 6) },
      en: { proofs: veepeeEn.proofs.slice(0, 6) },
    },
  },
  argTypes: {
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
} satisfies Meta<typeof ProofTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveProductionCampaigns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region');
    await expect(region).toHaveAttribute('tabindex', '0');

    const table = canvas.getByRole('table');
    await expect(table).toBeInTheDocument();

    const rowHeaders = canvas.getAllByRole('rowheader');
    await expect(rowHeaders.length).toBe(6);
  },
};

export const FullTenCampaigns: Story = {
  args: {
    proofs: veepeeFr.proofs,
  },
  parameters: {
    localizedArgs: {
      fr: { proofs: veepeeFr.proofs },
      en: { proofs: veepeeEn.proofs },
    },
  },
};
