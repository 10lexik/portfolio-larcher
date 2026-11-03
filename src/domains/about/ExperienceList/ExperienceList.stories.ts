import type { Meta, StoryObj } from '@storybook/svelte';
import ExperienceList from './ExperienceList.svelte';

const meta = {
  title: 'About/ExperienceList',
  component: ExperienceList,
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
} satisfies Meta<typeof ExperienceList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CareerTrackRecord: Story = {};

export const EnglishTrackRecord: Story = {
  args: {
    locale: 'en',
  },
};
