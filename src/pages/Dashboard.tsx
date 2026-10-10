import { Link } from 'react-router-dom'
import { Card, PageHeader } from '../components/ui'
import { CATEGORIES, classify } from '../lib/classify'
import { daysUntil, formatDateTime } from '../lib/format'
import { useStore } from '../lib/store'
import type { Category } from '../lib/types'

function Stat({ label, value, hint, to }: { label: string; value: number; hint: string; to: string }) {
  return (
    <Link to={to} className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-indigo-300">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Link>
  )
}

export default function Dashboard() {
  const { records, sources, rules, requests, audit } = useStore()

  const fieldCounts = new Map<Category, number>()
  for (const record of records) {
    for (const field of record.fields) {
      const { category } = classify(rules, field.key)
      fieldCounts.set(category, (fieldCounts.get(category) ?? 0) + 1)
    }
  }
  const categoryRows = [...fieldCounts].sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(1, ...fieldCounts.values())

  const subjects = new Set(records.map((r) => r.subject)).size
  const openRequests = requests.filter((r) => r.status === 'Open').sort((a, b) => a.dueAt.localeCompare(b.dueAt))

  return (
    <>
      <PageHeader title="Overview" subtitle="What your website is collecting, and what needs your attention." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Records stored" value={records.length} hint={`from ${sources.length} sources`} to="/records" />
        <Stat label="Data subjects" value={subjects} hint="unique individuals" to="/records" />
        <Stat label="Open requests" value={openRequests.length} hint="access, rectification, erasure" to="/requests" />
        <Stat
          label="Unclassified fields"
          value={fieldCounts.get('unclassified') ?? 0}
          hint="no rule matches yet"
          to="/classification"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Stored fields by category">
          <ul className="space-y-3 p-5">
            {categoryRows.map(([category, count]) => (
              <li key={category} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="text-slate-600">{CATEGORIES[category].label}</span>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${CATEGORIES[category].bar}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-right tabular-nums">{count}</span>
              </li>
            ))}
            {categoryRows.length === 0 && <li className="text-sm text-slate-500">No data stored.</li>}
          </ul>
        </Card>

        <Card title="Requests due next">
          <ul className="divide-y divide-slate-100">
            {openRequests.map((r) => {
              const days = daysUntil(r.dueAt)
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{r.type}</p>
                    <p className="truncate text-slate-500">{r.subject}</p>
                  </div>
                  <span className={`whitespace-nowrap ${days <= 7 ? 'font-medium text-red-600' : 'text-slate-500'}`}>
                    {days < 0 ? `${-days} days overdue` : `${days} days left`}
                  </span>
                </li>
              )
            })}
            {openRequests.length === 0 && <li className="px-5 py-6 text-sm text-slate-500">No open requests.</li>}
          </ul>
        </Card>

        <Card title="Records by source">
          <ul className="divide-y divide-slate-100">
            {sources.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>
                  {s.name}
                  {!s.active && <span className="ml-2 text-xs text-slate-400">paused</span>}
                </span>
                <span className="tabular-nums">{records.filter((r) => r.sourceId === s.id).length}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recent activity">
          <ul className="divide-y divide-slate-100">
            {audit.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0 truncate">
                  {e.action} <span className="text-slate-500">· {e.target}</span>
                </span>
                <span className="text-xs whitespace-nowrap text-slate-500">{formatDateTime(e.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
