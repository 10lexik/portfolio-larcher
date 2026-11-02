/**
 * Utilitaires de sécurité et d'assainissement (Anti-XSS & Safe URLs)
 * Disponible via l'alias transversal @core/utils/security
 */
import { SITE } from '@core/content/site';

export function safeURL(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  try {
    const trimmed = rawUrl.trim();
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('tel:')
    ) {
      return trimmed;
    }
    const parsed = new URL(trimmed, SITE.url);
    if (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' ||
      parsed.protocol === 'mailto:' ||
      parsed.protocol === 'tel:'
    ) {
      return parsed.href;
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Assainit une chaîne SVG brute en éliminant les balises exécutables et les attributs dangereux.
 */
export function sanitizeSvg(svgRaw: string | null | undefined): string {
  if (!svgRaw) return '';
  return (
    String(svgRaw)
      // Supprimer balises script, foreignObject, iframe, object, embed
      .replace(
        /<\s*(?:script|foreignObject|iframe|object|embed)[\s\S]*?(?:<\s*\/\s*(?:script|foreignObject|iframe|object|embed)\s*>|\/?>)/gi,
        '',
      )
      // Supprimer attributs d'événements on* (ex: onclick, onload, onerror)
      .replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      // Supprimer pseudo-protocoles dans href / xlink:href
      .replace(
        /(?:href|xlink:href)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi,
        'href="#"',
      )
      .replace(/(?:href|xlink:href)\s*=\s*(?:'data:[^']*'|"data:[^"]*"|data:[^\s>]+)/gi, 'href="#"')
  );
}
