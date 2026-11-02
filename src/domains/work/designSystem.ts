import assets from '@core/content/assets.json';
import type { Accent, Kpi, Locale } from '@core/content/types';
import { getDictionary } from '@core/i18n/t';
import type { TreeNode } from '@blocks/ComponentTree/ComponentTree.svelte';
import type { CaseInsightData } from '@blocks/CaseInsight/CaseInsight.svelte';
import type { SectionCopy } from './veepee';

type NonNoneAccent = Exclude<Accent, 'none'>;

interface Guardrail {
  command: string;
  scope: string;
}

interface DesignSystemContent {
  meta: {
    title: string;
    description: string;
  };
  codeRefs: typeof assets.designSystem.codeRefs;
  snippets: typeof assets.designSystem.snippets;
  prevCaseStudyHref: string;
  storybookHref: string;
  hero: {
    eyebrow: string;
    titlePrefix: string;
    titleHighlight: string;
    leadPrefix: string;
    leadSuffix: string;
    badges: string[];
    prevCaseCta: string;
  };
  sections: {
    contexte: SectionCopy;
    architecture: SectionCopy;
    principes: SectionCopy;
    motion: SectionCopy;
    gardefous: SectionCopy;
    workflow: SectionCopy;
    storybook: SectionCopy;
  };
  labels: ReturnType<typeof getDictionary>['designSystem']['labels'];
  kpis: Kpi[];
  stack: string[];
  insights: Record<
    'contexte' | 'architecture' | 'principes' | 'motion' | 'gardefous' | 'workflow' | 'storybook',
    CaseInsightData
  >;
  constraints: Array<{
    label: string;
    title: string;
    text: string;
    accent: NonNoneAccent;
    span: 1;
  }>;
  pillars: Array<{
    name: string;
    accent: NonNoneAccent;
    title: string;
    text: string;
  }>;
  srcTreeRoot: string;
  srcTree: TreeNode[];
  steps: Array<{
    title: string;
    text: string;
    accent: NonNoneAccent;
  }>;
  guardrails: Guardrail[];
  principles: Array<{
    label: string;
    text: string;
    accent: NonNoneAccent;
    span: 1 | 2;
  }>;
  workflow: Array<{
    title: string;
    text: string;
    accent: NonNoneAccent;
  }>;
  storybookFacts: Array<{
    title: string;
    text: string;
  }>;
  motionEngines: Array<{
    title: string;
    text: string;
    accent: NonNoneAccent;
    span: 1 | 2;
  }>;
  faq: Array<{
    title: string;
    content: string;
  }>;
}

export function getDesignSystemContent(locale: Locale = 'fr'): DesignSystemContent {
  const dict = getDictionary(locale).designSystem;
  const flow = assets.designSystem.dependencyFlow;

  const kpis: Kpi[] = assets.designSystem.kpiValues.map((value, i) => ({
    value,
    ...dict.kpis[i],
  }));

  const steps = flow.map((name, i) => ({
    title: name,
    text:
      i < flow.length - 1
        ? `${dict.labels.stepImportedByPrefix} ${flow.slice(i + 1).join(', ')}.`
        : dict.labels.stepLastLayer,
    accent: assets.designSystem.stepAccents[i] as NonNoneAccent,
  }));

  return {
    meta: dict.meta,
    codeRefs: assets.designSystem.codeRefs,
    snippets: assets.designSystem.snippets,
    prevCaseStudyHref: assets.routes[locale].veepee,
    storybookHref: assets.routes.storybook,
    hero: dict.hero,
    sections: dict.sections,
    labels: dict.labels,
    kpis,
    stack: [...dict.stack],
    insights: dict.insights,
    constraints: dict.constraints.map((c, i) => ({
      label: c.label,
      title: c.title,
      text: c.text,
      accent: assets.designSystem.constraintAccents[i] as NonNoneAccent,
      span: 1 as const,
    })),
    pillars: assets.designSystem.pillarsMeta.map((meta, i) => ({
      name: meta.name,
      accent: meta.accent as NonNoneAccent,
      title: dict.pillars[i].title,
      text: dict.pillars[i].text,
    })),
    srcTreeRoot: assets.designSystem.srcTreeRoot,
    srcTree: assets.designSystem.srcTreeFolders.map((folder, i) => ({
      folder,
      note: dict.srcTreeNotes[i],
    })),
    steps,
    guardrails: assets.designSystem.guardrailCommands.map((command, i) => ({
      command,
      scope: dict.guardrailScopes[i],
    })),
    principles: assets.designSystem.principlesMeta.map((meta, i) => ({
      label: dict.principles[i].label,
      text: dict.principles[i].text,
      accent: meta.accent as NonNoneAccent,
      span: meta.span as 1 | 2,
    })),
    workflow: dict.workflow.map((w, i) => ({
      title: w.title,
      text: w.text,
      accent: assets.designSystem.workflowAccents[i] as NonNoneAccent,
    })),
    storybookFacts: dict.storybookFacts,
    motionEngines: assets.designSystem.motionEnginesMeta.map((meta, i) => ({
      title: dict.motionEngines[i].title,
      text: dict.motionEngines[i].text,
      accent: meta.accent as NonNoneAccent,
      span: meta.span as 1 | 2,
    })),
    faq: dict.faq,
  };
}
