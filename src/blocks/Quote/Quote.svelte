<script lang="ts">
  import './Quote.css';

  interface Props {
    text: string;
    cite?: string;
    class?: string;
  }

  let { text, cite, class: className = '' }: Props = $props();
</script>

<figure class={['quote', className]} data-reveal>
  <blockquote class="quote__text">{text}</blockquote>
  {#if cite}<figcaption class="quote__cite">{cite}</figcaption>{/if}
</figure>
