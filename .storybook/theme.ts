import { create } from 'storybook/theming/create';

export const portfolioTheme = create({
  base: 'dark',
  brandTitle: 'Gwennaël Larcher · Design System',
  brandUrl: '/',
  brandTarget: '_self',

  colorPrimary: '#ec008c',
  colorSecondary: '#ec008c',

  appBg: '#090912',
  appContentBg: '#090912',
  appPreviewBg: '#090912',
  appBorderColor: 'rgba(255, 255, 255, 0.1)',
  appBorderRadius: 14,

  fontBase: '"Inter Variable", -apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
  fontCode: '"JetBrains Mono Variable", ui-monospace, "SFMono-Regular", monospace',

  textColor: '#e8e8f0',
  textInverseColor: '#090912',
  textMutedColor: '#9a9ab0',

  barTextColor: '#9a9ab0',
  barHoverColor: '#ff4fb0',
  barSelectedColor: '#ff4fb0',
  barBg: '#0d0d16',

  buttonBg: '#181826',
  buttonBorder: 'rgba(255, 255, 255, 0.14)',
  booleanBg: '#12121c',
  booleanSelectedBg: '#ec008c',

  inputBg: '#12121c',
  inputBorder: 'rgba(255, 255, 255, 0.16)',
  inputTextColor: '#e8e8f0',
  inputBorderRadius: 10,
});
