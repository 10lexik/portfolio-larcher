<script lang="ts">
  import './ComponentTree.css';

  export interface TreeNode {
    /** Nom de dossier (terminé par `/`) */
    folder?: string;
    /** Fichiers ou composants listés sur la même ligne ; l'extension colore le fichier */
    files?: string[];
    /** Commentaire aligné à droite de la ligne */
    note?: string;
    /** Met le dossier en avant (fond teinté sur son contenu) */
    featured?: boolean;
    /** Pastille affichée à côté du dossier mis en avant */
    badge?: string;
    children?: TreeNode[];
  }

  interface Props {
    /** Dossier racine affiché en tête */
    root: string;
    nodes: TreeNode[];
    /** Titre de l'arborescence */
    label?: string;
    class?: string;
  }

  let { root, nodes, label, class: className = '' }: Props = $props();

  const KNOWN_EXTENSIONS = new Set(['vue', 'ts', 'scss', 'md']);

  /** Extension connue d'un nom de fichier (`HeaderCus.vue`, `.scss`), sinon aucune */
  function extensionOf(file: string): string | undefined {
    const ext = file.split('.').pop();
    return file.includes('.') && ext && KNOWN_EXTENSIONS.has(ext) ? ext : undefined;
  }
</script>

{#snippet branch(items: TreeNode[])}
  <ul class="tree__list">
    {#each items as node, i (i)}
      <li class={['tree__node', node.featured && 'tree__node--featured']}>
        <div class="tree__row">
          {#if node.folder}<span class="tree__folder">{node.folder}</span>{/if}
          {#if node.badge}<span class="tree__badge">{node.badge}</span>{/if}
          {#each node.files ?? [] as file (file)}
            {@const ext = extensionOf(file)}
            <span class={['tree__file', ext && `tree__file--${ext}`]}>{file}</span>
          {/each}
          {#if node.note}<span class="tree__note">{node.note}</span>{/if}
        </div>
        {#if node.children}{@render branch(node.children)}{/if}
      </li>
    {/each}
  </ul>
{/snippet}

<figure class={['tree', className]}>
  {#if label}<figcaption class="tree__label">{label}</figcaption>{/if}
  <div class="tree__body">
    <p class="tree__root">{root}</p>
    {@render branch(nodes)}
  </div>
</figure>
