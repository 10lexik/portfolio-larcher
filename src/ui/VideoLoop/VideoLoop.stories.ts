import type { Meta, StoryObj } from '@storybook/svelte';
import VideoLoop from './VideoLoop.svelte';

const meta = {
  component: VideoLoop,
  tags: ['autodocs'],
  args: {
    src: '/media/videos/clip-path-slider.mp4',
    label: 'Démo : slider en clip-path',
    caption: 'Lue uniquement lorsqu’elle est visible.',
    ratio: '9 / 16',
  },
} satisfies Meta<typeof VideoLoop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClipPath: Story = {};
