import type { Meta, StoryObj } from '@storybook/svelte';
import CodeBlock from './CodeBlock.svelte';

const meta = {
  component: CodeBlock,
  tags: ['autodocs'],
  args: {
    label: 'HeaderCusTypes.ts',
    code: "export type HeaderVariant =\n  'top' | 'bottom' | 'pop-in' | 'block' | 'center'",
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScript: Story = {};
export const Scss: Story = {
  args: {
    label: 'HeaderCus.scss',
    code: '// variables par composant\n$headerCus-logo-width-desk: du(184px);\n$headerCus-color-text: white;',
  },
};
