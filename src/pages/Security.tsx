import { Badge, Card, PageHeader, tdClass, thClass } from '../components/ui'
import { formatDateTime } from '../lib/format'
import { useStore } from '../lib/store'

// Statuses are hardcoded until a backend can report them. Nothing here should
// read "enabled" unless the server has actually confirmed it.
const CONTROLS = [
  { name: 'Encryption in transit', detail: 'TLS between the client website, this console and the API.' },
  { name: 'Encryption at rest', detail: 'Database and backups encrypted with managed keys.' },
  { name: 'Field-level encryption', detail: 'Fields classified Sensitive encrypted individually before storage.' },
  { name: 'Key rotation', detail: 'Scheduled rotation of data encryption keys.' },
  { name: 'Role-based access', detail: 'Who may view, reveal, edit and delete records.' },
]

export default function Security() {
  const { audit } = useStore()

  return (
    <>
      <PageHeader title="Security & audit" subtitle="Protection controls, and a log of every action taken on stored data." />

      <Card title="Controls">
        <ul className="divide-y divide-slate-100">
          {CONTROLS.map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-4 px-5 py-3">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-sm text-slate-500">{c.detail}</p>
              </div>
              <Badge className="bg-slate-100 text-slate-600">Not connected</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Audit log" className="mt-6 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200">
            <tr>
              <th className={thClass}>When</th>
              <th className={thClass}>Who</th>
              <th className={thClass}>Action</th>
              <th className={thClass}>Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {audit.map((e) => (
              <tr key={e.id}>
                <td className={`${tdClass} whitespace-nowrap text-slate-600`}>{formatDateTime(e.at)}</td>
                <td className={tdClass}>{e.actor}</td>
                <td className={tdClass}>{e.action}</td>
                <td className={`${tdClass} text-slate-600`}>{e.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
