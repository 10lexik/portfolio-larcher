import type { Meta, StoryObj } from '@storybook/svelte';
import Button from './Button.svelte';

const meta = {
  component: Button,
  tags: ['autodocs'],
  args: { label: 'Voir le Case Study', variant: 'primary', size: 'md' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'dark', 'outline', 'ghost', 'danger', 'link'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Outline: Story = { args: { variant: 'outline' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Link: Story = { args: { variant: 'link', label: 'En savoir plus' } };
export const AsAnchor: Story = {
  args: { href: 'https://www.linkedin.com/in/legwarkshop', label: 'LinkedIn' },
};
export const Disabled: Story = { args: { disabled: true } };
