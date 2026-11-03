import type { Meta, StoryObj } from '@storybook/svelte';
import assets from '@core/content/assets.json';
import CodeBlock from './CodeBlock.svelte';

const meta = {
  component: CodeBlock,
  tags: ['autodocs'],
  args: {
    label: 'HeaderCusTypes.ts',
    code: assets.veepee.snippets.types,
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScript: Story = {
  name: 'TypeScript',
};

export const CssThemeTokens: Story = {
  name: 'CSS @theme Tokens',
  args: {
    label: 'src/core/styles/tokens.css',
    code: assets.designSystem.snippets.tokensExcerpt,
  },
};

export const ScssVariables: Story = {
  name: 'SCSS Variables',
  args: {
    label: 'HeaderCus.scss',
    code: assets.veepee.snippets.scssComponentTokens,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    code: assets.designSystem.snippets.checkCommand,
  },
};
