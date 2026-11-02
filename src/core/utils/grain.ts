/**
 * @file Générateur procédural de texture grain papier / encre (overlay fixe Viewport).
 * @description Synthétise au démarrage du client deux tuiles PNG bouclables aux
 * dimensions copremières (`380×422` et `528×490` par défaut) combinant :
 * 1. **Domain-Warped Value fBm 2D** (4 octaves + distorsion de domaine) pour reproduire
 *    les nuages organiques d'absorption d'encre et le moutonnement des fibres du papier,
 *    sans aucun motif de grille ni répétition perceptible.
 * 2. **Micro-grain stochastique haute fréquence** (PRNG Mulberry32 déterministe) modulé
 *    par la carte d'absorption basse fréquence.
 *
 * Tous les paramètres visuels (`--grain-*`) et les couleurs de base sont lus depuis
 * `src/core/styles/tokens.css` (SSOT). Les URLs `blob:` générées sont injectées via
 * `document.adoptedStyleSheets` pour éviter tout attribut `style=""` inline (conformité CSP).
 */

type RgbTuple = readonly [number, number, number];

interface GrainConfig {
  tileSize: number;
  scale: number;
  densityMin: number;
  densityMax: number;
  gradientContrast: number;
  inkDensityMin: number;
  inkDensityMax: number;
  inkOpacity: number;
  paperOpacity: number;
  ratioAY: number;
  ratioBX: number;
  ratioBY: number;
  inkRgb: RgbTuple;
  paperRgb: RgbTuple;
}

const GRAIN_OVERLAY_ID = 'print-grain';

let cachedVarsRule: string | null = null;
let grainStyleSheet: CSSStyleSheet | null = null;
const activeObjectUrls: string[] = [];

/**
 * Lit et parse une propriété personnalisée CSS numérique sur `:root`.
 */
function parseCssNumber(
  styles: CSSStyleDeclaration,
  propName: string,
  fallback: number,
  options?: { min?: number; max?: number },
): number {
  const raw = styles.getPropertyValue(propName).trim();
  if (!raw) return fallback;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;

  let value = parsed;
  if (options?.min !== undefined && value < options.min) value = options.min;
  if (options?.max !== undefined && value > options.max) value = options.max;
  return value;
}

/**
 * Convertit une couleur CSS (`#rgb`, `#rrggbb` ou `rgb(...)`) en tuple `[R, G, B]`.
 */
function parseCssColorToRgb(
  styles: CSSStyleDeclaration,
  propName: string,
  fallback: RgbTuple,
): RgbTuple {
  const raw = styles.getPropertyValue(propName).trim();
  if (!raw) return fallback;

  if (raw.startsWith('#')) {
    const hex = raw.slice(1).trim();
    if (hex.length === 3) {
      const r = Number.parseInt(hex[0] + hex[0], 16);
      const g = Number.parseInt(hex[1] + hex[1], 16);
      const b = Number.parseInt(hex[2] + hex[2], 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        return [r, g, b];
      }
    } else if (hex.length >= 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        return [r, g, b];
      }
    }
  }

  const rgbMatch = raw.match(/rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i);
  if (rgbMatch) {
    const r = Math.round(Number.parseFloat(rgbMatch[1]));
    const g = Math.round(Number.parseFloat(rgbMatch[2]));
    const b = Math.round(Number.parseFloat(rgbMatch[3]));
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return [
        Math.min(255, Math.max(0, r)),
        Math.min(255, Math.max(0, g)),
        Math.min(255, Math.max(0, b)),
      ];
    }
  }

  return fallback;
}

/**
 * Interpolation linéaire entre deux couleurs RGB.
 */
function mixRgbTuple(colorA: RgbTuple, colorB: RgbTuple, weightB: number): RgbTuple {
  const t = Math.min(1, Math.max(0, weightB));
  const inv = 1 - t;
  return [
    Math.round(colorA[0] * inv + colorB[0] * t),
    Math.round(colorA[1] * inv + colorB[1] * t),
    Math.round(colorA[2] * inv + colorB[2] * t),
  ];
}

/**
 * PRNG Mulberry32 déterministe.
 */
function createPrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Courbe quintique de Perlin (`6t^5 - 15t^4 + 10t^3`) à dérivées première et seconde nulles
 * aux bornes, éliminant tout artefact directionnel sur les cellules de la grille.
 */
function quinticFade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Lit les tokens `--grain-*` et les couleurs de marque sur `:root`.
 */
function readGrainConfig(): GrainConfig {
  const styles = getComputedStyle(document.documentElement);
  const darkRgb = parseCssColorToRgb(styles, '--color-brand-dark', [9, 9, 18]);
  const lightRgb = parseCssColorToRgb(styles, '--color-brand-light', [232, 232, 240]);
  const whiteRgb = parseCssColorToRgb(styles, '--color-white', [255, 255, 255]);

  return {
    tileSize: Math.round(parseCssNumber(styles, '--grain-tile-size', 380, { min: 160, max: 768 })),
    scale: parseCssNumber(styles, '--grain-scale', 0.5, { min: 0.25, max: 3 }),
    densityMin: parseCssNumber(styles, '--grain-density-min', 0.28, { min: 0, max: 1 }),
    densityMax: parseCssNumber(styles, '--grain-density-max', 0.96, { min: 0, max: 1 }),
    gradientContrast: parseCssNumber(styles, '--grain-gradient-contrast', 1.35, {
      min: 0.4,
      max: 3,
    }),
    inkDensityMin: parseCssNumber(styles, '--grain-ink-density-min', 0.8, {
      min: 0,
      max: 1,
    }),
    inkDensityMax: parseCssNumber(styles, '--grain-ink-density-max', 0.92, {
      min: 0,
      max: 1,
    }),
    inkOpacity: parseCssNumber(styles, '--grain-ink-opacity', 0.065, {
      min: 0,
      max: 0.5,
    }),
    paperOpacity: parseCssNumber(styles, '--grain-paper-opacity', 0.095, {
      min: 0,
      max: 0.5,
    }),
    ratioAY: parseCssNumber(styles, '--grain-ratio-a-y', 1.11, { min: 0.5, max: 2 }),
    ratioBX: parseCssNumber(styles, '--grain-ratio-b-x', 1.39, { min: 0.5, max: 2 }),
    ratioBY: parseCssNumber(styles, '--grain-ratio-b-y', 1.29, { min: 0.5, max: 2 }),
    inkRgb: darkRgb,
    paperRgb: mixRgbTuple(lightRgb, whiteRgb, 0.35),
  };
}

/**
 * Construit un évaluateur de bruit de valeur 2D périodique (toroïdal) sur une grille
 * `cellsX × cellsY`. Comme l'indexation est modulo `cellsX` / `cellsY`, la fonction est
 * mathématiquement continue et sans couture sur les bords `[0, 1) × [0, 1)`.
 */
function createPeriodicValueNoise2D(
  cellsX: number,
  cellsY: number,
  rand: () => number,
): (u: number, v: number) => number {
  const grid = new Float32Array(cellsX * cellsY);
  for (let i = 0; i < grid.length; i += 1) {
    grid[i] = rand();
  }

  return (u: number, v: number): number => {
    const wrappedU = ((u % 1) + 1) % 1;
    const wrappedV = ((v % 1) + 1) % 1;

    const gx = wrappedU * cellsX;
    const gy = wrappedV * cellsY;

    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const tx = quinticFade(gx - x0);
    const ty = quinticFade(gy - y0);

    const x0Mod = x0 % cellsX;
    const x1Mod = (x0 + 1) % cellsX;
    const y0Mod = (y0 % cellsY) * cellsX;
    const y1Mod = ((y0 + 1) % cellsY) * cellsX;

    const v00 = grid[y0Mod + x0Mod];
    const v10 = grid[y0Mod + x1Mod];
    const v01 = grid[y1Mod + x0Mod];
    const v11 = grid[y1Mod + x1Mod];

    const vx0 = v00 + (v10 - v00) * tx;
    const vx1 = v01 + (v11 - v01) * tx;
    return vx0 + (vx1 - vx0) * ty;
  };
}

/**
 * Génère une carte 2D de nuages d'absorption papier par **Domain-Warped fBm** (4 octaves
 * de bruit périodique + champ de distorsion organique), normalisée sur `[0, 1]`.
 */
function buildDomainWarpedCloudField(
  width: number,
  height: number,
  contrast: number,
  rand: () => number,
): Float32Array {
  // Grilles de distorsion de domaine (basses fréquences pour courber les nappes)
  const warpX = createPeriodicValueNoise2D(3, 3, rand);
  const warpY = createPeriodicValueNoise2D(3, 3, rand);
  const warpDetailX = createPeriodicValueNoise2D(7, 7, rand);
  const warpDetailY = createPeriodicValueNoise2D(7, 7, rand);

  // 4 octaves fBm sans coutures
  const oct1 = createPeriodicValueNoise2D(3, 3, rand);
  const oct2 = createPeriodicValueNoise2D(6, 6, rand);
  const oct3 = createPeriodicValueNoise2D(13, 13, rand);
  const oct4 = createPeriodicValueNoise2D(27, 27, rand);

  const field = new Float32Array(width * height);
  let minVal = Number.POSITIVE_INFINITY;
  let maxVal = Number.NEGATIVE_INFINITY;

  const invW = 1 / width;
  const invH = 1 / height;

  for (let y = 0; y < height; y += 1) {
    const v = y * invH;
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const u = x * invW;

      // Distorsion de domaine à deux échelles (élimine tout alignement axial)
      const du = (warpX(u, v) - 0.5) * 0.28 + (warpDetailX(u + 0.37, v + 0.61) - 0.5) * 0.11;
      const dv =
        (warpY(u + 0.53, v + 0.19) - 0.5) * 0.28 + (warpDetailY(u + 0.79, v + 0.23) - 0.5) * 0.11;

      const wu = u + du;
      const wv = v + dv;

      const n =
        oct1(wu, wv) * 0.46 + oct2(wu, wv) * 0.28 + oct3(wu, wv) * 0.16 + oct4(wu, wv) * 0.1;

      field[rowOffset + x] = n;
      if (n < minVal) minVal = n;
      if (n > maxVal) maxVal = n;
    }
  }

  // Normalisation dynamique [0, 1] + courbe de contraste en S autour de 0.5
  const span = Math.max(1e-5, maxVal - minVal);
  for (let i = 0; i < field.length; i += 1) {
    const norm = (field[i] - minVal) / span;
    const centered = (norm - 0.5) * contrast + 0.5;
    const clamped = Math.min(1, Math.max(0, centered));
    // Lissage smoothstep pour des transitions de nappes organiques
    field[i] = clamped * clamped * (3 - 2 * clamped);
  }

  return field;
}

/**
 * Convertit un `<canvas>` en Object URL `blob:` (ou fallback `data:` si indisponible).
 */
async function canvasToBlobUrl(canvas: HTMLCanvasElement): Promise<string> {
  if (typeof canvas.toBlob === 'function') {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/png');
    });
    if (blob) {
      const url = URL.createObjectURL(blob);
      activeObjectUrls.push(url);
      return url;
    }
  }
  return canvas.toDataURL('image/png');
}

/**
 * Synthétise une tuile PNG bouclable de dimensions `width × height`.
 */
async function renderGrainTileDataUrl(
  width: number,
  height: number,
  seed: number,
  config: GrainConfig,
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rand = createPrng(seed);
  const cloudField = buildDomainWarpedCloudField(width, height, config.gradientContrast, rand);

  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  const [inkR, inkG, inkB] = config.inkRgb;
  const [paperR, paperG, paperB] = config.paperRgb;
  const inkAlphaPeak = config.inkOpacity * 255;
  const paperAlphaPeak = config.paperOpacity * 255;

  const densityMin = Math.min(config.densityMin, config.densityMax);
  const densitySpan = Math.max(0.02, config.densityMax - densityMin);
  const inkRatioMin = Math.min(config.inkDensityMin, config.inkDensityMax);
  const inkRatioSpan = Math.max(0, config.inkDensityMax - inkRatioMin);

  // Carte de micro-bruit cellulaire pour donner aux fibres un léger groupement sub-pixel
  const microGrainField = new Float32Array(width * height);
  for (let i = 0; i < microGrainField.length; i += 1) {
    microGrainField[i] = rand();
  }

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;
    const nextRowOffset = ((y + 1) % height) * width;

    for (let x = 0; x < width; x += 1) {
      const idx = rowOffset + x;
      const offset = idx * 4;
      const cloud = cloudField[idx];

      // Probabilité locale de présence de grain modulée par la nappe d'absorption
      const localDensity = densityMin + cloud * densitySpan;
      if (rand() > localDensity) {
        continue;
      }

      // Légère corrélation isotrope avec les voisins pour imiter le feutrage du papier
      const n0 = microGrainField[idx];
      const nRight = microGrainField[rowOffset + ((x + 1) % width)];
      const nDown = microGrainField[nextRowOffset + x];
      const fiberIntensity = Math.pow(n0 * 0.72 + (nRight + nDown) * 0.14, 0.78);

      // Répartition encre sombre / fibre claire modulée par le nuage local
      const localInkRatio = inkRatioMin + (1 - cloud) * inkRatioSpan;

      if (rand() < localInkRatio) {
        // Micro-creux d'absorption d'encre + voile continu très doux
        const cloudBoost = 0.6 + (1 - cloud) * 0.55;
        pixels[offset] = inkR;
        pixels[offset + 1] = inkG;
        pixels[offset + 2] = inkB;
        pixels[offset + 3] = Math.min(
          255,
          Math.max(1, Math.round(fiberIntensity * inkAlphaPeak * cloudBoost)),
        );
      } else {
        // Fibre claire de papier affleurant à la surface
        const paperBoost = 0.65 + cloud * 0.55;
        pixels[offset] = paperR;
        pixels[offset + 1] = paperG;
        pixels[offset + 2] = paperB;
        pixels[offset + 3] = Math.min(
          255,
          Math.max(1, Math.round(fiberIntensity * paperAlphaPeak * paperBoost)),
        );
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToBlobUrl(canvas);
}

/**
 * Injecte les variables CSS de la texture via `document.adoptedStyleSheets`
 * afin de ne poser aucun attribut `style=""` inline (conformité `style-src` CSP).
 */
function applyGrainVars(cssRule: string): void {
  if (typeof CSSStyleSheet === 'undefined' || !('adoptedStyleSheets' in document)) {
    return;
  }

  if (!grainStyleSheet) {
    grainStyleSheet = new CSSStyleSheet();
  }

  grainStyleSheet.replaceSync(cssRule);

  if (!document.adoptedStyleSheets.includes(grainStyleSheet)) {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, grainStyleSheet];
  }
}

/**
 * Garantit la présence du conteneur `<div id="print-grain" class="print-grain">` dans le DOM.
 */
function ensureOverlayElement(): HTMLElement | null {
  if (typeof document === 'undefined' || !document.body) return null;

  const existing = document.getElementById(GRAIN_OVERLAY_ID);
  if (existing) return existing;

  const el = document.createElement('div');
  el.id = GRAIN_OVERLAY_ID;
  el.className = 'print-grain';
  el.setAttribute('aria-hidden', 'true');
  document.body.prepend(el);
  return el;
}

/**
 * Initialise et monte la texture de grain d'impression sur le viewport.
 * Les deux tuiles PNG ne sont synthétisées qu'une seule fois par session navigateur,
 * puis réappliquées instantanément lors des navigations client-side Astro ou Storybook.
 */
export function initPrintGrain(): void {
  const overlay = ensureOverlayElement();
  if (!overlay) return;

  if (cachedVarsRule) {
    applyGrainVars(cachedVarsRule);
    return;
  }

  const run = async () => {
    const config = readGrainConfig();
    const base = config.tileSize;

    // Dimensions copremières pour éviter tout alignement périodique entre les 2 nappes
    const wA = base;
    const hA = Math.round(base * config.ratioAY);
    const wB = Math.round(base * config.ratioBX);
    const hB = Math.round(base * config.ratioBY);

    const [tileA, tileB] = await Promise.all([
      renderGrainTileDataUrl(wA, hA, 0x4e4f524d, config),
      renderGrainTileDataUrl(wB, hB, 0x4c465232, config),
    ]);

    if (!tileA || !tileB) return;

    const cssScale = config.scale;
    const sizeAX = Math.round(wA * cssScale);
    const sizeAY = Math.round(hA * cssScale);
    const sizeBX = Math.round(wB * cssScale);
    const sizeBY = Math.round(hB * cssScale);

    cachedVarsRule = `:root { --grain-size-a: ${sizeAX}px ${sizeAY}px; --grain-size-b: ${sizeBX}px ${sizeBY}px; --grain-image-a: url("${tileA}"); --grain-image-b: url("${tileB}"); }`;
    applyGrainVars(cachedVarsRule);
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      void run();
    });
  } else {
    setTimeout(() => {
      void run();
    }, 16);
  }
}
