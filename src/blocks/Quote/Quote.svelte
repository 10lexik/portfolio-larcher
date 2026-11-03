<script lang="ts">
  import './Quote.css';

  interface Props {
    text: string;
    cite?: string;
    class?: string;
  }

  let { text, cite, class: className = '' }: Props = $props();
</script>

<!--
  @component
  Citation éditoriale grand corps (`--text-fluid-quote`) dans une `<figure>` sémantique associant `<blockquote>`
  et attribution `<figcaption>` optionnelle.
-->
<figure class={['quote', className]} data-reveal>
  <blockquote class="quote__text">{text}</blockquote>
  {#if cite}<figcaption class="quote__cite">{cite}</figcaption>{/if}
</figure>
