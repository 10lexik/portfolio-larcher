import type { Meta, StoryObj } from '@storybook/svelte';
import { htmlSnippet } from '@core/stories/storyHelpers';
import Split from './Split.svelte';

const textColumnFr = htmlSnippet(
  `<div>
    <p class="eyebrow">04 · Ingénierie Motion</p>
    <h3 style="margin:0.4rem 0 0.75rem;color:var(--color-white);font-size:var(--text-fluid-h3)">Orchestration déclarative à deux timelines</h3>
    <p style="margin:0;color:var(--color-text-muted);line-height:1.6">Le découpage entre la géométrie de mise en page et le moteur d’animation permet de coordonner le consentement, l’introduction et les déclencheurs au scroll sans conflit de transformation.</p>
  </div>`,
);

const textColumnEn = htmlSnippet(
  `<div>
    <p class="eyebrow">04 · Motion Engineering</p>
    <h3 style="margin:0.4rem 0 0.75rem;color:var(--color-white);font-size:var(--text-fluid-h3)">Two-timeline declarative orchestration</h3>
    <p style="margin:0;color:var(--color-text-muted);line-height:1.6">Decoupling layout geometry from the motion engine coordinates consent gating, hero intro, and scroll triggers without transform collisions.</p>
  </div>`,
);

const mediaColumn = htmlSnippet(
  `<div class="code-block">
    <p class="code-block__label">timelineManager.ts</p>
    <pre class="code-block__pre"><code>readyTimeline
  .addLabel('header')
  .add(headerIntroTl, 'header')
  .addLabel('headerAnimation&gt;', '&gt;')
  .add(stickyAppearTl, 'headerAnimation&gt;');</code></pre>
  </div>`,
);

const meta = {
  component: Split,
  tags: ['autodocs'],
  args: {
    reverse: false,
    center: true,
    children: textColumnFr,
    media: mediaColumn,
  },
  parameters: {
    localizedArgs: {
      fr: { children: textColumnFr },
      en: { children: textColumnEn },
    },
    docs: {
      source: {
        code: `<Split center={true} reverse={false}>
  <ComponentTree root="src/" nodes={srcTree} />
  {#snippet media()}
    <CodeBlock label="timelineManager.ts" code={snippet} />
  {/snippet}
</Split>`,
      },
    },
  },
  argTypes: {
    children: { control: false },
    media: { control: false },
  },
} satisfies Meta<typeof Split>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTwoColumns: Story = {};

export const ReversedMediaLeft: Story = {
  args: {
    reverse: true,
  },
};

export const TopAlignedColumns: Story = {
  args: {
    center: false,
  },
};

