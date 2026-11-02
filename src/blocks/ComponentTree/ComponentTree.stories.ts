import type { Meta, StoryObj } from '@storybook/svelte';
import ComponentTree from './ComponentTree.svelte';

const meta = {
  component: ComponentTree,
  tags: ['autodocs'],
  args: {
    label: 'Arborescence · exemple',
    root: 'src/components/',
    nodes: [
      {
        folder: 'Header/',
        featured: true,
        badge: 'composant complet',
        children: [
          { files: ['Header.vue', '.ts', '.scss'] },
          { files: ['HeaderTypes.ts'], note: 'contrat de props' },
          { files: ['Readme.md'], note: 'documentation embarquée' },
          { folder: 'variants/', files: ['Top', 'Bottom', 'Center'] },
        ],
      },
      { files: ['Slider', 'Cards', 'Gallery', '…'] },
    ],
  },
} satisfies Meta<typeof ComponentTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SansTitre: Story = { args: { label: undefined } };
