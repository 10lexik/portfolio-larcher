import type { Snippet } from 'svelte';

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
export type HeadingVariant =
  | 'hero'
  | 'title'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'lead'
  | 'body'
  | 'quote'
  | 'label'
  | 'punchline'
  | 'blockTitle';
export type HeadingTone = 'default' | 'muted' | 'accent' | 'gradient' | 'inverse';

export interface HeadingProp {
  /** Texte du titre (les espaces insécables françaises sont posées automatiquement) */
  text?: string;
  /** Contenu riche Svelte 5 optionnel remplaçant `text` */
  children?: Snippet;
  /** Balise HTML sémantique rendue (`h1`–`h6`, `p`, `span`, `div`) */
  as?: HeadingTag;
  /** Rôle typographique fluide indépendant du niveau sémantique (`hero`, `title`, `h1`–`h6`, `lead`…) */
  variant?: HeadingVariant;
  /** Tonalité chromatique (`default`, `muted`, `accent`, `gradient`, `inverse`) */
  tone?: HeadingTone;
  /** Découpe bicolore ou badge sur le préfixe (`:` / `—`) */
  splitTone?: boolean | 'badge' | 'accent';
  /** Sous-titre secondaire optionnel */
  subtitle?: string;
  /** Classe additionnelle sur le sous-titre */
  subtitleClass?: string;
  /** Entrée au scroll (contrat `data-reveal`) */
  appear?: boolean;
  class?: string;
}

export type ButtonVariant =
  'primary' | 'secondary' | 'dark' | 'outline' | 'ghost' | 'danger' | 'link' | 'unstyled';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

/** Lien d'un bouton : URL, ou objet `{ url | href }` */
export type ButtonLink = string | { url?: string; href?: string };

export interface ButtonProp {
  /** Libellé textuel du bouton ou du lien */
  label?: string;
  /** URL cible ; bascule automatiquement le rendu de `<button>` vers `<a>` (filtrée via `safeURL`) */
  href?: string;
  /** Objet lien CMS ou chaîne URL alternative */
  link?: ButtonLink;
  /** Style visuel issu des tokens (`primary`, `secondary`, `dark`, `outline`, `ghost`, `danger`, `link`) */
  variant?: ButtonVariant;
  /** Densité et corps typographique (`sm`, `md`, `lg`, `xl`, `icon`) */
  size?: ButtonSize;
  /** Étend le bouton sur 100 % de la largeur disponible */
  fullWidth?: boolean;
  /** Désactive l'interaction et neutralise la navigation si `href` est fourni */
  disabled?: boolean;
  /** Cible de navigation (`_blank`, `_self`…) lorsque rendu en `<a>` */
  target?: string;
  /** Relation du lien (`noopener noreferrer`…) */
  rel?: string;
  /** Icône SVG en ligne (chaîne, assainie au rendu via `sanitizeSvg`) */
  icon?: string;
  /** Position de l'icône par rapport au libellé */
  iconPosition?: 'left' | 'right';
  class?: string;
  /** Type natif du `<button>` lorsqu'aucun `href` n'est actif */
  type?: 'button' | 'submit' | 'reset';
  /** Contenu riche Svelte 5 optionnel */
  children?: Snippet;
  /** Gestionnaire de clic (bloqué automatiquement lorsque `disabled` vaut `true`) */
  onClick?: (e: MouseEvent) => void;
}
