<script lang="ts">
  import './Timeline.css';
  import type { Accent } from '@core/content/types';

  export interface TimelineStep {
    title: string;
    text: string;
    accent?: Accent;
  }

  interface Props {
    steps: TimelineStep[];
    class?: string;
  }

  let { steps, class: className = '' }: Props = $props();
</script>

<ol class={['timeline', className]}>
  {#each steps as step, i (step.title)}
    <li
      class={['timeline__step', `timeline__step--${step.accent ?? 'primary'}`]}
      data-reveal
      style:--reveal-index={i}
    >
      <span class="timeline__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      <h3 class="timeline__title">{step.title}</h3>
      <p class="timeline__text">{step.text}</p>
    </li>
  {/each}
</ol>
