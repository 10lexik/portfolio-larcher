import type { Meta, StoryObj } from '@storybook/svelte';
import VideoLoop from './VideoLoop.svelte';

const meta = {
  component: VideoLoop,
  tags: ['autodocs'],
  args: {
    src: '/media/videos/clip-path-slider.mp4',
    label: 'Démonstration GSAP : transition slider en clip-path',
    caption: 'Lecture pilotée par IntersectionObserver — mise en pause automatique hors écran.',
    ratio: '9 / 16',
    lazy: false,
    desktopOnly: false,
  },
  parameters: {
    localizedArgs: {
      fr: {
        label: 'Démonstration GSAP : transition slider en clip-path',
        caption: 'Lecture pilotée par IntersectionObserver — mise en pause automatique hors écran.',
      },
      en: {
        label: 'GSAP demo: clip-path slider transition',
        caption: 'Playback driven by IntersectionObserver — automatically paused off-screen.',
      },
    },
  },
  argTypes: {
    posterPriority: {
      control: 'inline-radio',
      options: ['high', 'low'],
    },
  },
} satisfies Meta<typeof VideoLoop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PortraitMotionDemo: Story = {};

export const LazyDesktopWithWebpPoster: Story = {
  args: {
    src: '/media/videos/brands/samsung.mp4',
    poster: '/media/brands/samsung-desk.webp',
    label: 'Aperçu desktop Samsung (16:10)',
    caption: 'Poster WebP immédiat + injection différée du flux H.264 à l’approche du viewport.',
    ratio: '16 / 10',
    lazy: true,
  },
  parameters: {
    localizedArgs: {
      fr: {
        label: 'Aperçu desktop Samsung (16:10)',
        caption:
          'Poster WebP immédiat + injection différée du flux H.264 à l’approche du viewport.',
      },
      en: {
        label: 'Samsung 16:10 desktop campaign preview',
        caption: 'Immediate WebP poster + deferred H.264 stream injection near viewport.',
      },
    },
  },
};

export const MobileZeroVideoBudget: Story = {
  args: {
    src: '/media/videos/brands/peugeot.mp4',
    poster: '/media/brands/peugeot-desk.webp',
    label: 'Aperçu campagne Peugeot (mode desktopOnly)',
    caption: 'Sous 768 px, seul le poster WebP est affiché (0 Mo vidéo téléchargé sur mobile).',
    ratio: '16 / 10',
    desktopOnly: true,
    posterPriority: 'high',
  },
  parameters: {
    localizedArgs: {
      fr: {
        label: 'Aperçu campagne Peugeot (mode desktopOnly)',
        caption: 'Sous 768 px, seul le poster WebP est affiché (0 Mo vidéo téléchargé sur mobile).',
      },
      en: {
        label: 'Peugeot campaign preview (desktopOnly mode)',
        caption: 'Below 768px, only the WebP poster renders (0 MB video downloaded on mobile).',
      },
    },
  },
};
