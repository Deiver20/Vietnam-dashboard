export interface PlanFeature {
  bold?: string;
  text?: string;
  boldEnd?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  desc: string;
  annual: number;
  monthly: number;
  save: string;
  feats: PlanFeature[];
  cta: string;
  featured: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PlanCardsProps {
  isMonthly: boolean;
}
