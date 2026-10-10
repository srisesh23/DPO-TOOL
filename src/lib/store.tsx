import { createContext, useContext, useState, type ReactNode } from 'react'
import { seedAudit, seedRecords, seedRequests, seedRules, seedSources } from './mockData'
import type { AuditEvent, DataRecord, RequestType, Rule, Source, SubjectRequest } from './types'

// In-memory stand-in for the backend. Every page reads and writes through this
// store, so swapping it for real API calls should not require touching the pages.

const ACTOR = 'You (admin)'
const REQUEST_DEADLINE_DAYS = 30

const uid = () => crypto.randomUUID().slice(0, 8)

interface Store {
  records: DataRecord[]
  sources: Source[]
  rules: Rule[]
  requests: SubjectRequest[]
  audit: AuditEvent[]
  updateField: (recordId: string, key: string, value: string) => void
  removeField: (recordId: string, key: string) => void
  deleteRecord: (recordId: string) => void
  eraseSubject: (subject: string) => void
  exportSubject: (subject: string) => void
  logReveal: (recordId: string) => void
  toggleSource: (sourceId: string) => void
  addRule: (rule: Omit<Rule, 'id' | 'enabled'>) => void
  toggleRule: (ruleId: string) => void
  deleteRule: (ruleId: string) => void
  addRequest: (type: RequestType, subject: string) => void
  completeRequest: (requestId: string) => void
}

const StoreContext = createContext<Store | null>(null)

function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState(seedRecords)
  const [sources, setSources] = useState(seedSources)
  const [rules, setRules] = useState(seedRules)
  const [requests, setRequests] = useState(seedRequests)
  const [audit, setAudit] = useState(seedAudit)

  const log = (action: string, target: string) =>
    setAudit((a) => [{ id: uid(), at: new Date().toISOString(), actor: ACTOR, action, target }, ...a])

  const patchRecord = (recordId: string, patch: (r: DataRecord) => DataRecord) =>
    setRecords((rs) => rs.map((r) => (r.id === recordId ? patch(r) : r)))

  const store: Store = {
    records,
    sources,
    rules,
    requests,
    audit,

    updateField(recordId, key, value) {
      patchRecord(recordId, (r) => ({
        ...r,
        fields: r.fields.map((f) => (f.key === key ? { ...f, value } : f)),
      }))
      log(`Field "${key}" edited`, recordId)
    },

    removeField(recordId, key) {
      patchRecord(recordId, (r) => ({ ...r, fields: r.fields.filter((f) => f.key !== key) }))
      log(`Field "${key}" deleted`, recordId)
    },

    deleteRecord(recordId) {
      setRecords((rs) => rs.filter((r) => r.id !== recordId))
      log('Record deleted', recordId)
    },

    eraseSubject(subject) {
      const count = records.filter((r) => r.subject === subject).length
      setRecords((rs) => rs.filter((r) => r.subject !== subject))
      log(`All data erased (${count} records)`, subject)
    },

    exportSubject(subject) {
      const data = records.filter((r) => r.subject === subject)
      downloadJson(`${subject}-data-export.json`, { subject, exportedAt: new Date().toISOString(), records: data })
      log(`Data exported (${data.length} records)`, subject)
    },

    logReveal(recordId) {
      log('Field values revealed', recordId)
    },

    toggleSource(sourceId) {
      const source = sources.find((s) => s.id === sourceId)
      if (!source) return
      setSources((ss) => ss.map((s) => (s.id === sourceId ? { ...s, active: !s.active } : s)))
      log(source.active ? 'Collection paused' : 'Collection resumed', source.name)
    },

    addRule(rule) {
      setRules((rs) => [...rs, { ...rule, id: `rule-${uid()}`, enabled: true }])
      log('Classification rule added', rule.keywords.join(', '))
    },

    toggleRule(ruleId) {
      setRules((rs) => rs.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)))
      log('Classification rule toggled', ruleId)
    },

    deleteRule(ruleId) {
      setRules((rs) => rs.filter((r) => r.id !== ruleId))
      log('Classification rule deleted', ruleId)
    },

    addRequest(type, subject) {
      const now = Date.now()
      const id = `req-${uid()}`
      setRequests((rs) => [
        {
          id,
          type,
          subject,
          receivedAt: new Date(now).toISOString(),
          dueAt: new Date(now + REQUEST_DEADLINE_DAYS * 86_400_000).toISOString(),
          status: 'Open',
        },
        ...rs,
      ])
      log(`${type} request logged`, subject)
    },

    completeRequest(requestId) {
      setRequests((rs) => rs.map((r) => (r.id === requestId ? { ...r, status: 'Completed' } : r)))
      log('Request completed', requestId)
    },
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
