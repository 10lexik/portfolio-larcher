import type { Meta, StoryObj } from '@storybook/svelte';
import { expect, within } from 'storybook/test';
import Header from './Header.svelte';

const meta = {
  title: 'Navigation/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    pathname: '/design-system',
  },
  argTypes: {
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
    pathname: {
      control: 'select',
      options: [
        '/',
        '/veepee-ad-studio',
        '/design-system',
        '/a-propos',
        '/en',
        '/en/design-system',
      ],
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveDesignSystemRoute: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation');
    await expect(nav).toBeInTheDocument();

    const activeLink = canvas.getByRole('link', { name: 'Design System' });
    await expect(activeLink).toHaveAttribute('aria-current', 'page');

    const headerEl = canvasElement.querySelector('header.site-header');
    await expect(headerEl).toHaveAttribute('data-theme', 'dark');
  },
};

export const HomeRoute: Story = {
  args: {
    pathname: '/',
  },
};

export const EnglishActiveRoute: Story = {
  args: {
    locale: 'en',
    pathname: '/en/veepee-ad-studio',
  },
};
