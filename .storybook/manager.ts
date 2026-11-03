import { addons } from 'storybook/manager-api';
import { portfolioTheme } from './theme';

addons.setConfig({
  theme: portfolioTheme,
  sidebar: {
    showRoots: true,
  },
});

