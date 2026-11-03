<script lang="ts">
  import './Accordion.css';

  export interface AccordionItem {
    title: string;
    content: string;
  }

  interface Props {
    items: AccordionItem[];
    /** Un seul panneau ouvert à la fois */
    exclusive?: boolean;
    /** Index du panneau ouvert au chargement */
    openIndex?: number;
    class?: string;
  }

  let { items, exclusive = true, openIndex = -1, class: className = '' }: Props = $props();

  const group = `accordion-${Math.random().toString(36).slice(2, 8)}`;
</script>

<!--
  @component
  Accordéon natif accessible reposant sur `<details>` / `<summary>` HTML5 sans surcharge JS d'état.
  Supporte l'ouverture mutuellement exclusive via l'attribut standard `name` partagé par groupe.
-->
<div class={['accordion', className]}>
  {#each items as item, i (item.title)}
    <details class="accordion__item" name={exclusive ? group : undefined} open={i === openIndex}>
      <summary class="accordion__summary">
        <span>{item.title}</span>
        <span class="accordion__icon" aria-hidden="true"></span>
      </summary>
      <p class="accordion__content">{item.content}</p>
    </details>
  {/each}
</div>
