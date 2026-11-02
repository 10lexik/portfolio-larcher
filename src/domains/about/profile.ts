import assets from '@core/content/assets.json';
import type { Locale } from '@core/content/types';
import { getDictionary } from '@core/i18n/t';

type SkillAccent = 'primary' | 'violet' | 'mint';

interface SkillItem {
  title: string;
  accent: SkillAccent;
  text: string;
}

interface Role {
  period: string;
  title: string;
  company: string;
  points: string[];
}

interface EducationItem {
  period: string;
  title: string;
  text: string;
}

interface ProfileContent {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    titleRole: string;
    titleSuffix: string;
    lead: string;
    codepenLabel: string;
  };
  sections: {
    skills: { eyebrow: string; title: string };
    experience: { eyebrow: string; title: string };
    education: { eyebrow: string; title: string };
  };
  skills: SkillItem[];
  experience: Role[];
  education: EducationItem[];
  philosophy: {
    text: string;
    cite: string;
  };
}

export function getProfileContent(locale: Locale = 'fr'): ProfileContent {
  const dict = getDictionary(locale).about;

  return {
    meta: dict.meta,
    hero: dict.hero,
    sections: dict.sections,
    skills: dict.skills.map((item, i) => ({
      title: item.title,
      accent: assets.about.skillAccents[i] as SkillAccent,
      text: item.text,
    })),
    experience: dict.experience.map((item, i) => ({
      period: assets.about.experiencePeriods[i],
      title: item.title,
      company: item.company,
      points: [...item.points],
    })),
    education: dict.education.map((item, i) => ({
      period: assets.about.educationPeriods[i],
      title: item.title,
      text: item.text,
    })),
    philosophy: dict.philosophy,
  };
}
