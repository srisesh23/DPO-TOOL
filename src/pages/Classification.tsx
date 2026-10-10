import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import {
  Button,
  Card,
  CategoryBadge,
  PageHeader,
  SensitivityBadge,
  Toggle,
  inputClass,
  tdClass,
  thClass,
} from '../components/ui'
import { CATEGORIES, SENSITIVITIES, classify } from '../lib/classify'
import { useStore } from '../lib/store'
import type { Category, Sensitivity } from '../lib/types'

export default function Classification() {
  const { rules, records, addRule, toggleRule, deleteRule } = useStore()
  const [keywords, setKeywords] = useState('')
  const [category, setCategory] = useState<Category>('identity')
  const [sensitivity, setSensitivity] = useState<Sensitivity>('personal')
  const [testKey, setTestKey] = useState('')

  const parsed = keywords
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (parsed.length === 0) return
    addRule({ keywords: parsed, category, sensitivity })
    setKeywords('')
  }

  const unclassified = [
    ...new Set(
      records.flatMap((r) => r.fields.map((f) => f.key)).filter((k) => classify(rules, k).category === 'unclassified'),
    ),
  ]
  const testResult = testKey.trim() ? classify(rules, testKey) : null

  return (
    <>
      <PageHeader
        title="Classification"
        subtitle="Rules that label incoming fields by category and sensitivity. The first matching rule wins."
      />

      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200">
            <tr>
              <th className={thClass}>Field name contains</th>
              <th className={thClass}>Category</th>
              <th className={thClass}>Sensitivity</th>
              <th className={thClass}>Enabled</th>
              <th className={thClass} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <tr key={rule.id} className={rule.enabled ? '' : 'opacity-60'}>
                <td className={tdClass}>
                  <div className="flex flex-wrap gap-1">
                    {rule.keywords.map((k) => (
                      <code key={k} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                        {k}
                      </code>
                    ))}
                  </div>
                </td>
                <td className={tdClass}>
                  <CategoryBadge category={rule.category} />
                </td>
                <td className={tdClass}>
                  <SensitivityBadge sensitivity={rule.sensitivity} />
                </td>
                <td className={tdClass}>
                  <Toggle checked={rule.enabled} onChange={() => toggleRule(rule.id)} label={`Enable rule ${rule.keywords[0]}`} />
                </td>
                <td className={`${tdClass} text-right`}>
                  <Button variant="ghost" aria-label="Delete rule" onClick={() => deleteRule(rule.id)}>
                    <Trash2 size={15} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 border-t border-slate-200 p-4">
          <input
            aria-label="Keywords"
            className={`${inputClass} min-w-48 flex-1`}
            placeholder="Keywords, e.g. passport, ssn"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <select aria-label="Category" className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {Object.entries(CATEGORIES)
              .filter(([key]) => key !== 'unclassified')
              .map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
          <select
            aria-label="Sensitivity"
            className={inputClass}
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value as Sensitivity)}
          >
            {Object.entries(SENSITIVITIES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <Button variant="primary" type="submit" disabled={parsed.length === 0}>
            <Plus size={15} /> Add rule
          </Button>
        </form>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card title="Unclassified fields in your data">
          <div className="p-5">
            {unclassified.length === 0 ? (
              <p className="text-sm text-slate-500">Every stored field matches a rule.</p>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-600">No rule matches these yet. Click one to start a rule for it.</p>
                <div className="flex flex-wrap gap-2">
                  {unclassified.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setKeywords(key.replace(/_/g, ', '))}
                      className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs hover:bg-indigo-100"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        <Card title="Test a field name">
          <div className="p-5">
            <input
              aria-label="Field name to test"
              className={`${inputClass} w-full`}
              placeholder="e.g. customer_email"
              value={testKey}
              onChange={(e) => setTestKey(e.target.value)}
            />
            {testResult && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-slate-500">Would be labelled</span>
                <CategoryBadge category={testResult.category} />
                <SensitivityBadge sensitivity={testResult.sensitivity} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
