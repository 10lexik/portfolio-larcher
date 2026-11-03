import type { Meta, StoryObj } from '@storybook/svelte';
import { getDesignSystemContent } from '@domains/work/designSystem';
import Bento from './Bento.svelte';

const dsFr = getDesignSystemContent('fr');
const dsEn = getDesignSystemContent('en');

const meta = {
  component: Bento,
  tags: ['autodocs'],
  args: {
    items: dsFr.principles.map((p) => ({
      title: p.label,
      text: p.text,
      accent: p.accent,
      span: p.span,
    })),
  },
  parameters: {
    localizedArgs: {
      fr: {
        items: dsFr.principles.map((p) => ({
          title: p.label,
          text: p.text,
          accent: p.accent,
          span: p.span,
        })),
      },
      en: {
        items: dsEn.principles.map((p) => ({
          title: p.label,
          text: p.text,
          accent: p.accent,
          span: p.span,
        })),
      },
    },
  },
} satisfies Meta<typeof Bento>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AsymmetricEngineeringGrid: Story = {};

export const ThreeColumnConstraints: Story = {
  args: {
    items: dsFr.constraints,
  },
  parameters: {
    localizedArgs: {
      fr: { items: dsFr.constraints },
      en: { items: dsEn.constraints },
    },
  },
};
