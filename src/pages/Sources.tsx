import { Badge, Card, CategoryBadge, PageHeader, Toggle } from '../components/ui'
import { classify } from '../lib/classify'
import { formatDate } from '../lib/format'
import { useStore } from '../lib/store'

const SNIPPET = `<script src="https://YOUR-DPO-TOOL-HOST/collect.js"
        data-site-key="YOUR_SITE_KEY" async></script>`

export default function Sources() {
  const { sources, records, rules, toggleSource } = useStore()

  return (
    <>
      <PageHeader title="Collection sources" subtitle="The places on your website where personal data enters the system." />

      <div className="grid gap-4 md:grid-cols-2">
        {sources.map((source) => {
          const own = records.filter((r) => r.sourceId === source.id)
          const latest = own.map((r) => r.collectedAt).sort().at(-1)
          const categories = [...new Set(own.flatMap((r) => r.fields.map((f) => classify(rules, f.key).category)))]
          return (
            <Card key={source.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{source.name}</h2>
                  <p className="text-sm text-slate-500">
                    {source.type} · {source.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={source.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}>
                    {source.active ? 'Collecting' : 'Paused'}
                  </Badge>
                  <Toggle
                    checked={source.active}
                    onChange={() => toggleSource(source.id)}
                    label={`Collect from ${source.name}`}
                  />
                </div>
              </div>
              <dl className="mt-4 flex gap-8 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Records</dt>
                  <dd className="font-medium tabular-nums">{own.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Last collected</dt>
                  <dd className="font-medium">{latest ? formatDate(latest) : '—'}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-1">
                {categories.map((c) => (
                  <CategoryBadge key={c} category={c} />
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      <Card title="Connect your website" className="mt-6">
        <div className="p-5">
          <p className="text-sm text-slate-600">
            Once the collection service exists, clients will paste a snippet like this into their site. The host and
            site key below are placeholders.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">{SNIPPET}</pre>
        </div>
      </Card>
    </>
  )
}
