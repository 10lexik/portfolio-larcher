import type { Meta, StoryObj } from '@storybook/svelte';
import Figure from './Figure.svelte';

const meta = {
  component: Figure,
  tags: ['autodocs'],
  args: {
    src: '/media/brands/samsung-desk.webp',
    alt: 'Opération Samsung en production, version desktop',
    caption: 'Clic sur l’image : agrandissement dans une boîte de dialogue native.',
    ratio: '16 / 10',
    lightbox: true,
    reconstruction: false,
  },
} satisfies Meta<typeof Figure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Reconstruction: Story = {
  args: {
    reconstruction: true,
    src: '/media/variants/pop-in.webp',
    alt: 'HeaderCus, variant pop-in',
  },
};
export const WithoutLightbox: Story = { args: { lightbox: false } };
