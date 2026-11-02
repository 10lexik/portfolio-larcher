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
  text?: string;
  children?: Snippet;
  as?: HeadingTag;
  variant?: HeadingVariant;
  tone?: HeadingTone;
  splitTone?: boolean | 'badge' | 'accent';
  subtitle?: string;
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
  label?: string;
  href?: string;
  link?: ButtonLink;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  target?: string;
  rel?: string;
  /** Icône SVG en ligne (chaîne, assainie au rendu) */
  icon?: string;
  iconPosition?: 'left' | 'right';
  class?: string;
  type?: 'button' | 'submit' | 'reset';
  children?: Snippet;
  onClick?: (e: MouseEvent) => void;
}
