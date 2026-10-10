import { Check, Download, Eye, EyeOff, Pencil, Search, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Button,
  Card,
  CategoryBadge,
  ConfirmDialog,
  Drawer,
  PageHeader,
  SensitivityBadge,
  inputClass,
  tdClass,
  thClass,
} from '../components/ui'
import { CATEGORIES, classify } from '../lib/classify'
import { formatDate, mask } from '../lib/format'
import { useStore } from '../lib/store'
import type { Category, DataRecord } from '../lib/types'

type PendingDelete = { kind: 'record' } | { kind: 'field'; key: string } | { kind: 'subject' }

function RecordDrawer({ record, onClose }: { record: DataRecord; onClose: () => void }) {
  const { rules, sources, records, updateField, removeField, deleteRecord, eraseSubject, exportSubject, logReveal } =
    useStore()
  const [revealed, setRevealed] = useState(false)
  const [editing, setEditing] = useState<{ key: string; value: string } | null>(null)
  const [pending, setPending] = useState<PendingDelete | null>(null)

  const source = sources.find((s) => s.id === record.sourceId)
  const subjectRecordCount = records.filter((r) => r.subject === record.subject).length

  const toggleReveal = () => {
    if (!revealed) logReveal(record.id)
    setRevealed(!revealed)
  }

  const saveEdit = () => {
    if (editing) updateField(record.id, editing.key, editing.value)
    setEditing(null)
  }

  const confirmDelete = () => {
    if (!pending) return
    if (pending.kind === 'field') removeField(record.id, pending.key)
    else if (pending.kind === 'record') deleteRecord(record.id)
    else eraseSubject(record.subject)
    setPending(null)
    if (pending.kind !== 'field') onClose()
  }

  return (
    <Drawer title={`Record ${record.id}`} onClose={onClose}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {[
          ['Data subject', record.subject],
          ['Source', source?.name ?? 'Unknown'],
          ['Collected', formatDate(record.collectedAt)],
          ['Retain until', formatDate(record.retentionUntil)],
          ['Legal basis', record.legalBasis],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="truncate font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Fields</h3>
        <Button variant="ghost" onClick={toggleReveal}>
          {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
          {revealed ? 'Hide values' : 'Reveal values'}
        </Button>
      </div>

      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {record.fields.map((field) => {
          const { category, sensitivity } = classify(rules, field.key)
          const isEditing = editing?.key === field.key
          return (
            <li key={field.key} className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                <code className="text-xs text-slate-600">{field.key}</code>
                <CategoryBadge category={category} />
                <SensitivityBadge sensitivity={sensitivity} />
              </div>
              {isEditing ? (
                <form
                  className="mt-2 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    saveEdit()
                  }}
                >
                  <input
                    autoFocus
                    aria-label={`New value for ${field.key}`}
                    className={`${inputClass} min-w-0 flex-1`}
                    value={editing.value}
                    onChange={(e) => setEditing({ key: field.key, value: e.target.value })}
                  />
                  <Button variant="primary" type="submit" aria-label="Save">
                    <Check size={15} />
                  </Button>
                  <Button onClick={() => setEditing(null)} aria-label="Cancel edit">
                    <X size={15} />
                  </Button>
                </form>
              ) : (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="min-w-0 text-sm break-words">{revealed ? field.value : mask(field.value)}</span>
                  <span className="flex shrink-0">
                    <Button
                      variant="ghost"
                      aria-label={`Edit ${field.key}`}
                      onClick={() => setEditing({ key: field.key, value: field.value })}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label={`Delete ${field.key}`}
                      onClick={() => setPending({ kind: 'field', key: field.key })}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </span>
                </div>
              )}
            </li>
          )
        })}
        {record.fields.length === 0 && <li className="p-3 text-sm text-slate-500">This record has no fields left.</li>}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={() => exportSubject(record.subject)}>
          <Download size={15} /> Export subject's data
        </Button>
        <Button onClick={() => setPending({ kind: 'record' })}>
          <Trash2 size={15} /> Delete record
        </Button>
        <Button variant="danger" onClick={() => setPending({ kind: 'subject' })}>
          <Trash2 size={15} /> Erase subject
        </Button>
      </div>

      {pending && (
        <ConfirmDialog
          title={
            pending.kind === 'field'
              ? `Delete "${pending.key}"?`
              : pending.kind === 'record'
                ? `Delete record ${record.id}?`
                : `Erase all data for ${record.subject}?`
          }
          body={
            pending.kind === 'subject'
              ? `This permanently removes ${subjectRecordCount} record${subjectRecordCount === 1 ? '' : 's'} across every source. It cannot be undone.`
              : 'This cannot be undone.'
          }
          confirmLabel={pending.kind === 'subject' ? 'Erase everything' : 'Delete'}
          onConfirm={confirmDelete}
          onCancel={() => setPending(null)}
        />
      )}
    </Drawer>
  )
}

export default function Records() {
  const { records, sources, rules } = useStore()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [sourceId, setSourceId] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [openId, setOpenId] = useState<string | null>(null)

  const categoriesOf = (r: DataRecord) => [...new Set(r.fields.map((f) => classify(rules, f.key).category))]

  const q = query.trim().toLowerCase()
  const visible = records.filter(
    (r) =>
      (!q || r.subject.includes(q) || r.id.includes(q) || r.fields.some((f) => f.value.toLowerCase().includes(q))) &&
      (!sourceId || r.sourceId === sourceId) &&
      (!category || categoriesOf(r).includes(category)),
  )
  const open = records.find((r) => r.id === openId)

  return (
    <>
      <PageHeader title="Data records" subtitle="Everything collected from your website. Open a record to view, edit or delete it." />

      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-56 flex-1">
          <Search size={15} className="absolute top-2.5 left-3 text-slate-400" />
          <input
            className={`${inputClass} w-full pl-9`}
            placeholder="Search by subject, record ID or value"
            value={query}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
          />
        </label>
        <select aria-label="Filter by source" className={inputClass} value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by category"
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | '')}
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200">
            <tr>
              <th className={thClass}>Data subject</th>
              <th className={thClass}>Source</th>
              <th className={thClass}>Contains</th>
              <th className={thClass}>Collected</th>
              <th className={thClass}>Retain until</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((r) => (
              <tr key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer hover:bg-slate-50">
                <td className={tdClass}>
                  <button type="button" className="text-left font-medium hover:text-indigo-700">
                    {r.subject}
                  </button>
                  <p className="text-xs text-slate-500">{r.id}</p>
                </td>
                <td className={tdClass}>{sources.find((s) => s.id === r.sourceId)?.name}</td>
                <td className={tdClass}>
                  <div className="flex flex-wrap gap-1">
                    {categoriesOf(r).map((c) => (
                      <CategoryBadge key={c} category={c} />
                    ))}
                  </div>
                </td>
                <td className={`${tdClass} whitespace-nowrap text-slate-600`}>{formatDate(r.collectedAt)}</td>
                <td className={`${tdClass} whitespace-nowrap text-slate-600`}>{formatDate(r.retentionUntil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No records match.</p>}
      </Card>
      <p className="mt-3 text-xs text-slate-500">
        Showing {visible.length} of {records.length} records
      </p>

      {open && <RecordDrawer record={open} onClose={() => setOpenId(null)} />}
    </>
  )
}
