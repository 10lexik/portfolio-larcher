import { createRawSnippet, type Component, type Snippet } from 'svelte';
import { getDictionary } from '@core/i18n/t';
import StoryGrid from './StoryGrid.svelte';

export interface StoryCell {
  caption: string;
  component: Component<Record<string, unknown>>;
  props: Record<string, unknown>;
}

interface StoryMatrixOptions {
  cells: StoryCell[];
  stack?: boolean;
  minWidth?: string;
}

/**
 * Construit une matrice typée de variantes pour `StoryGrid.svelte` sans recourir à `any`.
 */
export function matrixCells<P extends object>(
  component: Component<P>,
  entries: Array<{ caption: string; props: P }>,
): StoryCell[] {
  return entries.map((entry) => ({
    caption: entry.caption,
    component: component as unknown as Component<Record<string, unknown>>,
    props: entry.props as Record<string, unknown>,
  }));
}

/**
 * Génère la fonction `render` d'une story matricielle `StoryGrid` compatible avec `StoryObj<typeof meta>`.
 */
export function renderMatrix<TRender>(options: StoryMatrixOptions): TRender {
  return (() => ({
    Component: StoryGrid,
    props: options,
  })) as unknown as TRender;
}

/**
 * Crée un `Snippet` Svelte 5 natif à partir d'un fragment HTML racine unique pour les stories à slots.
 */
export function htmlSnippet(singleRootMarkup: string): Snippet {
  return createRawSnippet(() => ({
    render: () => singleRootMarkup,
  }));
}

export const frDict = getDictionary('fr');
export const enDict = getDictionary('en');
