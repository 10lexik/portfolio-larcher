export type Locale = 'fr' | 'en';

export type Accent = 'primary' | 'violet' | 'mint' | 'blue' | 'amber' | 'none';

export interface Kpi {
  value: number;
  prefix?: string;
  suffix?: string;
  display?: string;
  label: string;
  note?: string;
}
