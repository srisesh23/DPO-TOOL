import type { AuditEvent, DataRecord, Field, Rule, Source, SubjectRequest } from './types'

const DAY = 24 * 60 * 60 * 1000
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY).toISOString()

export const seedSources: Source[] = [
  { id: 'src-contact', name: 'Contact form', type: 'Form', location: '/contact', active: true },
  { id: 'src-newsletter', name: 'Newsletter signup', type: 'Form', location: 'Site footer', active: true },
  { id: 'src-checkout', name: 'Checkout', type: 'API', location: '/checkout', active: true },
  { id: 'src-booking', name: 'Appointment booking', type: 'Form', location: '/book', active: true },
  { id: 'src-analytics', name: 'Analytics & consent', type: 'Cookie banner', location: 'All pages', active: true },
]

export const seedRules: Rule[] = [
  { id: 'rule-health', keywords: ['health', 'medical', 'allergy', 'diagnosis'], category: 'health', sensitivity: 'sensitive', enabled: true },
  { id: 'rule-financial', keywords: ['card', 'iban', 'billing', 'payment'], category: 'financial', sensitivity: 'sensitive', enabled: true },
  { id: 'rule-identity', keywords: ['name', 'birth', 'passport', 'gender'], category: 'identity', sensitivity: 'personal', enabled: true },
  { id: 'rule-contact', keywords: ['email', 'phone', 'address'], category: 'contact', sensitivity: 'personal', enabled: true },
  { id: 'rule-technical', keywords: ['ip', 'device', 'agent', 'cookie'], category: 'technical', sensitivity: 'personal', enabled: true },
  { id: 'rule-behavioral', keywords: ['pages', 'clicks', 'marketing', 'preferences'], category: 'behavioral', sensitivity: 'low', enabled: true },
]

const people = [
  ['Amara', 'Okafor'], ['Lukas', 'Becker'], ['Priya', 'Nair'], ['Mateo', 'Ruiz'],
  ['Hana', 'Sato'], ['Elin', 'Lindqvist'], ['Omar', 'Haddad'], ['Chloe', 'Martin'],
  ['Tomasz', 'Kowalski'], ['Noor', 'Rahman'], ['Isla', 'Fraser'], ['Diego', 'Costa'],
]

function fieldsFor(sourceId: string, i: number, first: string, last: string, email: string): Field[] {
  const name = `${first} ${last}`
  switch (sourceId) {
    case 'src-contact':
      return [
        { key: 'full_name', value: name },
        { key: 'email', value: email },
        { key: 'phone', value: `+44 7700 9${String(10000 + i * 137).slice(0, 5)}` },
        { key: 'message', value: 'Could someone call me back about pricing?' },
      ]
    case 'src-newsletter':
      return [
        { key: 'first_name', value: first },
        { key: 'email', value: email },
        { key: 'marketing_opt_in', value: 'true' },
      ]
    case 'src-checkout':
      return [
        { key: 'full_name', value: name },
        { key: 'email', value: email },
        { key: 'billing_address', value: `${12 + i} Harbour Street, Bristol` },
        { key: 'card_last4', value: String(4000 + i * 211).slice(0, 4) },
      ]
    case 'src-booking':
      return [
        { key: 'full_name', value: name },
        { key: 'email', value: email },
        { key: 'date_of_birth', value: `19${70 + i}-0${(i % 9) + 1}-1${i % 9}` },
        { key: 'health_notes', value: 'Penicillin allergy' },
      ]
    default:
      return [
        { key: 'ip_address', value: `203.0.113.${20 + i}` },
        { key: 'device_id', value: `d-${(987654 + i * 7919).toString(16)}` },
        { key: 'pages_viewed', value: String(3 + (i % 7)) },
        { key: 'referrer', value: 'google.com' },
      ]
  }
}

export const seedRecords: DataRecord[] = Array.from({ length: 24 }, (_, i) => {
  const [first, last] = people[i % people.length]
  const source = seedSources[i % seedSources.length]
  const email = `${first}.${last}@example.com`.toLowerCase()
  return {
    id: `rec-${String(1001 + i)}`,
    subject: email,
    sourceId: source.id,
    collectedAt: daysFromNow(-(i * 3 + 1)),
    retentionUntil: daysFromNow(365 - i * 3),
    legalBasis: source.id === 'src-checkout' ? 'Contract' : 'Consent',
    fields: fieldsFor(source.id, i, first, last, email),
  }
})

export const seedRequests: SubjectRequest[] = [
  { id: 'req-301', type: 'Erasure', subject: 'lukas.becker@example.com', receivedAt: daysFromNow(-26), dueAt: daysFromNow(4), status: 'Open' },
  { id: 'req-302', type: 'Access', subject: 'priya.nair@example.com', receivedAt: daysFromNow(-9), dueAt: daysFromNow(21), status: 'Open' },
  { id: 'req-303', type: 'Rectification', subject: 'hana.sato@example.com', receivedAt: daysFromNow(-2), dueAt: daysFromNow(28), status: 'Open' },
  { id: 'req-300', type: 'Access', subject: 'omar.haddad@example.com', receivedAt: daysFromNow(-40), dueAt: daysFromNow(-10), status: 'Completed' },
]

export const seedAudit: AuditEvent[] = [
  { id: 'evt-1', at: daysFromNow(-1), actor: 'System', action: 'Record collected', target: 'rec-1001' },
  { id: 'evt-2', at: daysFromNow(-2), actor: 'System', action: 'Request received', target: 'req-303' },
]
