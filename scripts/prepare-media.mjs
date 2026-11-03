/**
 * Prépare les médias du portfolio (conversion WebP, redimensionnement, copie des vidéos).
 * Source : ~/Workspace/case-studies/assets (captures déjà réalisées, aucune nouvelle capture).
 * Sortie : public/media/ (servi en cache immuable, voir vercel.json).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = process.env.CASE_STUDIES_ASSETS ?? '/Users/glarcher/Workspace/case-studies/assets';
const OUT = join(ROOT, 'public/media');

const dirs = ['boards', 'brands', 'variants', 'videos'];
dirs.forEach((d) => mkdirSync(join(OUT, d), { recursive: true }));

async function toWebp(from, to, width, quality = 82) {
  const input = join(SRC, from);
  if (!existsSync(input)) throw new Error(`Source introuvable : ${input}`);
  await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(join(OUT, to));
  console.log('ok', to);
}

// Planches (Retina 3200×2000 → 2400 de large)
const boards = [
  ['boards/01-bento-styleguide.png', 'boards/component-factory.webp'],
  ['boards/02-chameleon-effect.png', 'boards/chameleon.webp'],
  ['boards/03-anatomie-micro-interactions.png', 'boards/anatomy.webp'],
  ['boards/04-design-to-code-workflow.png', 'boards/design-to-code.webp'],
];
for (const [from, to] of boards) await toWebp(from, to, 2400, 84);

// Opérations en production (desktop + mobile)
const brands = {
  samsung: 'samsung',
  peugeot: 'peugeot',
  'claudie-pierlot': 'cpierlot',
  mms: 'mymms',
  'pink-october': 'pink',
  picard: 'picard',
  'pierre-vacances': 'pvacances',
  'coffee-b': 'coffeeb',
};
for (const [name, key] of Object.entries(brands)) {
  await toWebp(`raw/${key}-desk-0.png`, `brands/${name}-desk.webp`, 1400);
  await toWebp(`raw/${key}-mob-0.png`, `brands/${name}-mob.webp`, 560);
}

// Variants HeaderCus (rendu réel, version neutre)
for (const v of ['top', 'bottom', 'pop-in', 'block', 'center']) {
  await toWebp(`raw/neutral-${v}-desk.png`, `variants/${v}.webp`, 900);
}

// Démos vidéo des Readme (HeaderCusAnimation) — ré-encodage H.264 sans piste audio + faststart
const videos = [
  ['02-animation-clip-path-animation-slider.mp4', 'clip-path-slider.mp4'],
  ['03-animation-with-imageappear-true-textappe.mp4', 'image-text-appear.mp4'],
  ['15-animation-filtered-true-background-image.mp4', 'scroll-filtered.mp4'],
  ['16-animation-default-pin-pin-true-fixing-ba.mp4', 'scroll-pin.mp4'],
];
for (const [from, to] of videos) {
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-v',
      'error',
      '-i',
      join(SRC, 'videos', from),
      '-crf',
      '25',
      '-maxrate',
      '780k',
      '-bufsize',
      '1560k',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-profile:v',
      'high',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      join(OUT, 'videos', to),
    ],
    { stdio: 'inherit' },
  );
  console.log('ok', `videos/${to}`);
}

// Image de partage social 1200×630
await sharp(join(SRC, 'boards/02-chameleon-effect.png'))
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .jpeg({ quality: 82 })
  .toFile(join(OUT, 'og.jpg'));
console.log('ok og.jpg');
