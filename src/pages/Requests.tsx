import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, ConfirmDialog, PageHeader, inputClass, tdClass, thClass } from '../components/ui'
import { daysUntil, formatDate } from '../lib/format'
import { useStore } from '../lib/store'
import type { RequestType, SubjectRequest } from '../lib/types'

const TYPE_BADGE: Record<RequestType, string> = {
  Access: 'bg-sky-100 text-sky-800',
  Rectification: 'bg-amber-100 text-amber-800',
  Erasure: 'bg-red-100 text-red-800',
}

export default function Requests() {
  const { requests, records, addRequest, completeRequest, exportSubject, eraseSubject } = useStore()
  const [subject, setSubject] = useState('')
  const [type, setType] = useState<RequestType>('Access')
  const [erasing, setErasing] = useState<SubjectRequest | null>(null)

  const countFor = (s: string) => records.filter((r) => r.subject === s).length

  const submit = (e: FormEvent) => {
    e.preventDefault()
    addRequest(type, subject.trim().toLowerCase())
    setSubject('')
  }

  const sorted = [...requests].sort(
    (a, b) => a.status.localeCompare(b.status) * -1 || a.dueAt.localeCompare(b.dueAt),
  )

  return (
    <>
      <PageHeader
        title="Subject requests"
        subtitle="Requests from individuals to access, correct or erase their data. New requests are due in 30 days."
      />

      <Card className="mb-6">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 p-4">
          <input
            type="email"
            required
            aria-label="Data subject email"
            className={`${inputClass} min-w-56 flex-1`}
            placeholder="Data subject's email"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <select aria-label="Request type" className={inputClass} value={type} onChange={(e) => setType(e.target.value as RequestType)}>
            <option>Access</option>
            <option>Rectification</option>
            <option>Erasure</option>
          </select>
          <Button variant="primary" type="submit">
            <Plus size={15} /> Log request
          </Button>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200">
            <tr>
              <th className={thClass}>Type</th>
              <th className={thClass}>Data subject</th>
              <th className={thClass}>Received</th>
              <th className={thClass}>Due</th>
              <th className={thClass} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((r) => {
              const days = daysUntil(r.dueAt)
              const count = countFor(r.subject)
              return (
                <tr key={r.id}>
                  <td className={tdClass}>
                    <Badge className={TYPE_BADGE[r.type]}>{r.type}</Badge>
                  </td>
                  <td className={tdClass}>
                    <p className="font-medium">{r.subject}</p>
                    <p className="text-xs text-slate-500">
                      {count} record{count === 1 ? '' : 's'} held
                    </p>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-slate-600`}>{formatDate(r.receivedAt)}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {r.status === 'Completed' ? (
                      <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
                    ) : (
                      <span className={days <= 7 ? 'font-medium text-red-600' : 'text-slate-600'}>
                        {days < 0 ? `${-days} days overdue` : `${days} days left`}
                      </span>
                    )}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    {r.status === 'Open' && (
                      <div className="flex justify-end gap-2">
                        {r.type === 'Access' && (
                          <Button
                            variant="primary"
                            onClick={() => {
                              exportSubject(r.subject)
                              completeRequest(r.id)
                            }}
                          >
                            Export &amp; complete
                          </Button>
                        )}
                        {r.type === 'Rectification' && (
                          <>
                            <Link
                              to={`/records?q=${encodeURIComponent(r.subject)}`}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                            >
                              Edit records
                            </Link>
                            <Button variant="primary" onClick={() => completeRequest(r.id)}>
                              Mark complete
                            </Button>
                          </>
                        )}
                        {r.type === 'Erasure' && (
                          <Button variant="danger" onClick={() => setErasing(r)}>
                            Erase &amp; complete
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {erasing && (
        <ConfirmDialog
          title={`Erase all data for ${erasing.subject}?`}
          body={`This permanently removes ${countFor(erasing.subject)} record(s) across every source and completes the request. It cannot be undone.`}
          confirmLabel="Erase everything"
          onConfirm={() => {
            eraseSubject(erasing.subject)
            completeRequest(erasing.id)
            setErasing(null)
          }}
          onCancel={() => setErasing(null)}
        />
      )}
    </>
  )
}
