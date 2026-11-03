import assets from '@core/content/assets.json';
import type { Accent, Kpi, Locale } from '@core/content/types';
import { getDictionary } from '@core/i18n/t';
import type { TreeNode } from '@blocks/ComponentTree/ComponentTree.svelte';
import type { CaseInsightData } from '@blocks/CaseInsight/CaseInsight.svelte';

type BrandId = keyof typeof assets.media.brands;
type CaseBrandId = keyof typeof assets.media.brands &
  keyof ReturnType<typeof getDictionary>['veepee']['brandCases'];
type NonNoneAccent = Exclude<Accent, 'none'>;

export interface Brand {
  id: string;
  name: string;
  market: string;
  href: string;
  video: string;
  videoMob: string;
  posterDesk: string;
  posterMob: string;
  ratioDesk: string;
  ratioMob: string;
  challenge: string;
  resolution: string;
  components: string[];
}

interface VariantSpec {
  id: string;
  folder: string;
  desc: string;
  example: string;
}

interface GsapComponentSpec {
  name: string;
  path: string;
  badge: string;
  accent: NonNoneAccent;
  variants: string[];
  gsapFeatures: string[];
  problem: string;
  resolution: string;
  usedIn: string;
  code: string;
}

export interface Proof {
  brand: string;
  href: string;
  display: string;
  note: string;
}

export interface SectionCopy {
  eyebrow: string;
  title: string;
  lead?: string;
}

interface VeepeeContent {
  meta: {
    title: string;
    description: string;
  };
  codeRefs: typeof assets.veepee.codeRefs;
  snippets: typeof assets.veepee.snippets;
  nextCaseStudyHref: string;
  learningAccents: readonly NonNoneAccent[];
  hero: {
    eyebrow: string;
    titlePrefix: string;
    titleHighlight: string;
    lead: string;
    badges: string[];
    roleIntroPrefix: string;
    roleIntroSuffix: string;
  };
  sections: {
    marques: SectionCopy;
    contexte: SectionCopy;
    architecture: SectionCopy;
    thematisation: SectionCopy;
    variants: SectionCopy;
    headerAnimation: SectionCopy;
    catalogueGsap: SectionCopy;
    gouvernance: SectionCopy;
    impact: SectionCopy;
    apprentissages: SectionCopy;
  };
  labels: ReturnType<typeof getDictionary>['veepee']['labels'];
  kpis: Kpi[];
  rolePillars: Array<{ role: string; accent: NonNoneAccent; text: string }>;
  featuredBrands: Brand[];
  problems: Array<{ label: string; text: string }>;
  quoteText: string;
  sectionInsights: Record<
    | 'architecture'
    | 'thematisation'
    | 'variants'
    | 'headerAnimation'
    | 'catalogueGsap'
    | 'gouvernance',
    CaseInsightData
  >;
  componentTreeRoot: string;
  componentTree: TreeNode[];
  archKpis: Kpi[];
  levers: Array<{ title: string; text: string }>;
  variantItems: VariantSpec[];
  headerAnimationKpis: Kpi[];
  headerAnimationPillars: Array<{ label: string; title: string; text: string }>;
  demoVideos: Array<{ src: string; poster: string; label: string; caption: string }>;
  gsapComponents: GsapComponentSpec[];
  figmaChain: Array<{
    label: string;
    accent: NonNoneAccent;
    items: string[];
  }>;
  rules: Array<{ label: string; text: string }>;
  proofs: Proof[];
  impact: Array<{ label: string; text: string }>;
  learnings: string[];
}

export function getVeepeeContent(locale: Locale = 'fr'): VeepeeContent {
  const dict = getDictionary(locale).veepee;
  const struct = assets.veepee.componentTreeStructure;
  const notes = dict.componentTreeNotes;

  const kpis: Kpi[] = assets.veepee.kpiMetrics.map((metric, i) => ({
    ...metric,
    ...dict.kpis[i],
  }));

  const featuredBrands: Brand[] = assets.media.featuredBrandIds.map((rawId) => {
    const id = rawId as CaseBrandId;
    const assetBrand = assets.media.brands[id];
    const copyBrand = dict.brandCases[id];
    return {
      id: rawId,
      name: assetBrand.name,
      market: assetBrand.market,
      href: assetBrand.href,
      video: assetBrand.videoDesk,
      videoMob: assetBrand.videoMob,
      posterDesk: assetBrand.posterDesk,
      posterMob: assetBrand.posterMob,
      ratioDesk: assets.media.ratios.desktop,
      ratioMob: assets.media.ratios.mobile,
      challenge: copyBrand.challenge,
      resolution: copyBrand.resolution,
      components: [...assetBrand.components],
    };
  });

  const componentTree: TreeNode[] = [
    {
      files: [...struct.atomicRow1],
      note: notes.atomic,
    },
    {
      files: [...struct.atomicRow2],
    },
    {
      folder: struct.modulusFolder,
      note: notes.modulus,
      children: [
        {
          folder: struct.headerCusFolder,
          featured: true,
          badge: notes.headerCusBadge,
          children: [
            { files: [...struct.headerCusCoreFiles] },
            { files: [...struct.headerCusTypesFile], note: notes.headerCusTypes },
            { files: [...struct.headerCusReadmeFile], note: notes.headerCusReadme },
            { folder: struct.variantsFolder, files: [...struct.variantsFiles] },
            {
              folder: struct.headerAnimFolder,
              featured: true,
              badge: notes.headerAnimBadge,
              files: [...struct.headerAnimFiles],
            },
          ],
        },
        {
          files: [...struct.modulusRow1],
          note: notes.modulusRow1,
        },
        {
          files: [...struct.modulusRow2],
        },
      ],
    },
  ];

  const proofs: Proof[] = assets.media.proofBrandIds.map((rawId) => {
    const id = rawId as BrandId;
    const assetBrand = assets.media.brands[id];
    return {
      brand: assetBrand.name,
      href: assetBrand.href,
      display: assetBrand.display,
      note: dict.proofNotes[id],
    };
  });

  return {
    meta: dict.meta,
    codeRefs: assets.veepee.codeRefs,
    snippets: assets.veepee.snippets,
    nextCaseStudyHref: assets.routes[locale].designSystem,
    learningAccents: assets.veepee.learningAccents as NonNoneAccent[],
    hero: dict.hero,
    sections: dict.sections,
    labels: dict.labels,
    kpis,
    rolePillars: dict.rolePillars.map((item, i) => ({
      role: item.role,
      accent: assets.veepee.rolePillarAccents[i] as NonNoneAccent,
      text: item.text,
    })),
    featuredBrands,
    problems: dict.problems,
    quoteText: dict.quoteText,
    sectionInsights: dict.sectionInsights,
    componentTreeRoot: assets.veepee.componentTreeRoot,
    componentTree,
    archKpis: assets.veepee.archKpiMetrics.map((metric, i) => ({
      ...metric,
      label: dict.archKpiLabels[i],
    })),
    levers: dict.levers,
    variantItems: assets.veepee.variants.map((v, i) => ({
      id: v.id,
      folder: v.folder,
      desc: dict.variantDescs[i],
      example: v.example,
    })),
    headerAnimationKpis: assets.veepee.headerAnimationKpiValues.map((value, i) => ({
      value,
      label: dict.headerAnimationKpiLabels[i],
    })),
    headerAnimationPillars: dict.headerAnimationPillars,
    demoVideos: assets.media.headerAnimationVideos.map((media, i) => ({
      src: media.src,
      poster: media.poster,
      label: dict.demoVideos[i].label,
      caption: dict.demoVideos[i].caption,
    })),
    gsapComponents: assets.veepee.gsapComponentsMeta.map((meta, i) => ({
      name: dict.gsapComponents[i].name,
      path: meta.path,
      badge: dict.gsapComponents[i].badge,
      accent: meta.accent as NonNoneAccent,
      variants: [...meta.variants],
      gsapFeatures: [...dict.gsapComponents[i].gsapFeatures],
      problem: dict.gsapComponents[i].problem,
      resolution: dict.gsapComponents[i].resolution,
      usedIn: dict.gsapComponents[i].usedIn,
      code: meta.code,
    })),
    figmaChain: dict.figmaChain.map((step, i) => ({
      label: step.label,
      accent: assets.veepee.figmaChainAccents[i] as NonNoneAccent,
      items: [...step.items],
    })),
    rules: dict.rules,
    proofs,
    impact: dict.impact,
    learnings: [...dict.learnings],
  };
}
