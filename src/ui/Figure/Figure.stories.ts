import type { Meta, StoryObj } from '@storybook/svelte';
import { expect, userEvent, within } from 'storybook/test';
import Figure from './Figure.svelte';

const meta = {
  component: Figure,
  tags: ['autodocs'],
  args: {
    src: '/media/brands/samsung-desk.webp',
    alt: 'Opération Samsung en production, version desktop 16:10',
    caption: 'Clic sur l’image : agrandissement dans une boîte de dialogue native <dialog>.',
    ratio: '16 / 10',
    fit: 'cover',
    lightbox: true,
    reconstruction: false,
  },
  parameters: {
    localizedArgs: {
      fr: {
        alt: 'Opération Samsung en production, version desktop 16:10',
        caption: 'Clic sur l’image : agrandissement dans une boîte de dialogue native <dialog>.',
      },
      en: {
        alt: 'Live Samsung brand campaign, 16:10 desktop view',
        caption: 'Click the image to inspect inside a native modal <dialog>.',
      },
    },
  },
  argTypes: {
    fit: {
      control: 'inline-radio',
      options: ['cover', 'contain'],
    },
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
} satisfies Meta<typeof Figure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveLightbox: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');
    const dialog = canvasElement.querySelector('dialog');
    await expect(dialog).not.toBeNull();
    await expect(dialog).not.toHaveAttribute('open');

    if (dialog && typeof dialog.showModal === 'function') {
      await userEvent.click(trigger);
      await expect(dialog).toHaveAttribute('open');

      const closeButton = dialog.querySelector('button');
      if (closeButton) {
        await userEvent.click(closeButton);
        await expect(dialog).not.toHaveAttribute('open');
      }
    }
  },
};

export const HistoricalReconstruction: Story = {
  args: {
    src: '/media/variants/pop-in.webp',
    alt: 'HeaderCus · variant pop-in',
    caption: 'Reconstitution fidèle à partir du dépôt /base-vue-3.',
    reconstruction: true,
  },
  parameters: {
    localizedArgs: {
      fr: {
        alt: 'HeaderCus · variant pop-in',
        caption: 'Reconstitution fidèle à partir du dépôt /base-vue-3.',
      },
      en: {
        alt: 'HeaderCus · pop-in variant',
        caption: 'Faithful reconstruction from the historical /base-vue-3 repository.',
      },
    },
  },
};

export const StaticWithoutLightbox: Story = {
  args: {
    src: '/media/boards/design-to-code.webp',
    alt: 'Chaîne Design-to-Code Figma vers composants',
    lightbox: false,
    caption: 'Cadre statique sans bouton d’ouverture modale.',
  },
  parameters: {
    localizedArgs: {
      fr: {
        alt: 'Chaîne Design-to-Code Figma vers composants',
        caption: 'Cadre statique sans bouton d’ouverture modale.',
      },
      en: {
        alt: 'Figma-to-Code component pipeline board',
        caption: 'Static media frame without modal trigger.',
      },
    },
  },
};
