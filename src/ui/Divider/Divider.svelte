<script lang="ts">
  import './Divider.css';

  type DividerSize = 'small' | 'medium' | 'large' | 'huge';

  interface Props {
    size?: DividerSize;
    showLine?: boolean;
    class?: string;
  }

  let { size = 'medium', showLine = false, class: className = '' }: Props = $props();
</script>

<!--
  @component
  Respiration verticale rythmée (`small` → `huge`) avec filet décoratif optionnel (`showLine`).
  Marqué `role="separator"` et `aria-hidden="true"` pour ne pas bruiter la navigation vocale.
-->
<div role="separator" aria-hidden="true" class={['divider', `divider--${size}`, className]}>
  {#if showLine}
    <div class="divider__line"></div>
  {/if}
</div>
