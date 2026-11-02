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

<div role="separator" aria-hidden="true" class={['divider', `divider--${size}`, className]}>
  {#if showLine}
    <div class="divider__line"></div>
  {/if}
</div>
