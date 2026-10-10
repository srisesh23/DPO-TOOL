import type { Category, Rule, Sensitivity } from './types'

export interface Classification {
  category: Category
  sensitivity: Sensitivity
}

export const CATEGORIES: Record<Category, { label: string; badge: string; bar: string }> = {
  identity: { label: 'Identity', badge: 'bg-violet-100 text-violet-800', bar: 'bg-violet-500' },
  contact: { label: 'Contact', badge: 'bg-sky-100 text-sky-800', bar: 'bg-sky-500' },
  financial: { label: 'Financial', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  health: { label: 'Health', badge: 'bg-rose-100 text-rose-800', bar: 'bg-rose-500' },
  behavioral: { label: 'Behavioral', badge: 'bg-teal-100 text-teal-800', bar: 'bg-teal-500' },
  technical: { label: 'Technical', badge: 'bg-slate-200 text-slate-800', bar: 'bg-slate-500' },
  unclassified: {
    label: 'Unclassified',
    badge: 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300',
    bar: 'bg-slate-300',
  },
}

export const SENSITIVITIES: Record<Sensitivity, { label: string; badge: string }> = {
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-700' },
  personal: { label: 'Personal', badge: 'bg-indigo-100 text-indigo-800' },
  sensitive: { label: 'Sensitive', badge: 'bg-red-100 text-red-800' },
}

/** First enabled rule with a keyword equal to one of the field name's words wins. */
export function classify(rules: Rule[], fieldKey: string): Classification {
  const words = fieldKey.toLowerCase().split(/[^a-z0-9]+/)
  const rule = rules.find((r) => r.enabled && r.keywords.some((k) => words.includes(k)))
  return rule
    ? { category: rule.category, sensitivity: rule.sensitivity }
    : { category: 'unclassified', sensitivity: 'low' }
}
