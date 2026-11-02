<script lang="ts">
  import './CodeBlock.css';
  import { highlight } from '@core/utils/highlight';

  interface Props {
    code: string;
    /** Nom du fichier ou titre de l'extrait */
    label?: string;
    class?: string;
  }

  let { code, label, class: className = '' }: Props = $props();

  const html = $derived(highlight(code));
</script>

<div class={['code-block', className]}>
  {#if label}<p class="code-block__label">{label}</p>{/if}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <pre class="code-block__pre"><code>{@html html}</code></pre>
</div>
