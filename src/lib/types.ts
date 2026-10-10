export type Category =
  | 'identity'
  | 'contact'
  | 'financial'
  | 'health'
  | 'behavioral'
  | 'technical'
  | 'unclassified'

export type Sensitivity = 'low' | 'personal' | 'sensitive'

export type LegalBasis = 'Consent' | 'Contract' | 'Legitimate interest' | 'Legal obligation'

export interface Field {
  key: string
  value: string
}

export interface DataRecord {
  id: string
  subject: string
  sourceId: string
  collectedAt: string
  retentionUntil: string
  legalBasis: LegalBasis
  fields: Field[]
}

export type SourceType = 'Form' | 'Cookie banner' | 'API' | 'Webhook'

export interface Source {
  id: string
  name: string
  type: SourceType
  location: string
  active: boolean
}

export interface Rule {
  id: string
  /** Keywords matched against the words of a field name. */
  keywords: string[]
  category: Category
  sensitivity: Sensitivity
  enabled: boolean
}

export type RequestType = 'Access' | 'Rectification' | 'Erasure'

export interface SubjectRequest {
  id: string
  type: RequestType
  subject: string
  receivedAt: string
  dueAt: string
  status: 'Open' | 'Completed'
}

export interface AuditEvent {
  id: string
  at: string
  actor: string
  action: string
  target: string
}
