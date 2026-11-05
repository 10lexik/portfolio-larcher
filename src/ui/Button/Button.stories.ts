import type { Meta, StoryObj } from '@storybook/svelte';
import { expect, fn, userEvent, within } from 'storybook/test';
import { enDict, frDict, matrixCells, renderMatrix } from '@core/stories/storyHelpers';
import Button from './Button.svelte';

const ARROW_SVG =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const meta = {
  component: Button,
  tags: ['autodocs'],
  args: {
    label: frDict.ui.viewCaseStudy,
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  parameters: {
    localizedArgs: {
      fr: { label: frDict.ui.viewCaseStudy },
      en: { label: enDict.ui.viewCaseStudy },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'dark', 'outline', 'ghost', 'danger', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    iconPosition: {
      control: 'inline-radio',
      options: ['left', 'right'],
    },
    icon: {
      control: false,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const AllVariants: Story = {
  render: renderMatrix({
    minWidth: '13rem',
    cells: matrixCells(Button, [
      { caption: 'variant="primary"', props: { label: 'Primary CTA', variant: 'primary' } },
      { caption: 'variant="outline"', props: { label: 'Outline', variant: 'outline' } },
      { caption: 'variant="secondary"', props: { label: 'Secondary', variant: 'secondary' } },
      { caption: 'variant="dark"', props: { label: 'Dark Surface', variant: 'dark' } },
      { caption: 'variant="ghost"', props: { label: 'Ghost Action', variant: 'ghost' } },
      { caption: 'variant="danger"', props: { label: 'Destructive', variant: 'danger' } },
      { caption: 'variant="link"', props: { label: 'Editorial Link →', variant: 'link' } },
      {
        caption: 'disabled={true}',
        props: { label: 'Disabled', variant: 'primary', disabled: true },
      },
    ]),
  }),
  parameters: {
    docs: {
      source: {
        code: `<Button label="Primary CTA" variant="primary" />
<Button label="Outline" variant="outline" />
<Button label="Secondary" variant="secondary" />
<Button label="Ghost Action" variant="ghost" />`,
      },
    },
  },
};

export const SizeScale: Story = {
  render: renderMatrix({
    minWidth: '12rem',
    cells: matrixCells(Button, [
      { caption: 'size="sm"', props: { label: 'Small (sm)', size: 'sm', variant: 'primary' } },
      { caption: 'size="md"', props: { label: 'Medium (md)', size: 'md', variant: 'primary' } },
      { caption: 'size="lg"', props: { label: 'Large (lg)', size: 'lg', variant: 'primary' } },
      { caption: 'size="xl"', props: { label: 'Display (xl)', size: 'xl', variant: 'primary' } },
    ]),
  }),
};

export const WithSanitizedIcon: Story = {
  args: {
    label: frDict.ui.openStorybook,
    variant: 'outline',
    size: 'lg',
    icon: ARROW_SVG,
    iconPosition: 'right',
  },
  parameters: {
    localizedArgs: {
      fr: { label: frDict.ui.openStorybook },
      en: { label: enDict.ui.openStorybook },
    },
  },
};

export const AsAnchor: Story = {
  args: {
    href: 'https://www.linkedin.com/in/legwarkshop',
    target: '_blank',
    rel: 'noopener noreferrer',
    label: frDict.ui.contactLinkedIn,
    variant: 'outline',
  },
  parameters: {
    localizedArgs: {
      fr: { label: frDict.ui.contactLinkedIn },
      en: { label: enDict.ui.contactLinkedIn },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/legwarkshop');
  },
};

export const DisabledGuard: Story = {
  args: {
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
