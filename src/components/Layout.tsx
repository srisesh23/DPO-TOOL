import { Database, Inbox, LayoutDashboard, Lock, Radio, ShieldCheck, Tags } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../lib/store'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/records', label: 'Data records', icon: Database },
  { to: '/sources', label: 'Collection sources', icon: Radio },
  { to: '/classification', label: 'Classification', icon: Tags },
  { to: '/requests', label: 'Subject requests', icon: Inbox },
  { to: '/security', label: 'Security & audit', icon: Lock },
]

export default function Layout() {
  const { requests } = useStore()
  const openRequests = requests.filter((r) => r.status === 'Open').length

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:w-60 md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-5 py-4">
          <ShieldCheck className="text-indigo-600" size={22} />
          <span className="font-semibold tracking-tight">DPO Tool</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={17} />
              {label}
              {to === '/requests' && openRequests > 0 && (
                <span className="ml-auto rounded-full bg-indigo-600 px-1.5 text-xs text-white">{openRequests}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 md:pl-60">
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-900">
          Prototype — running on sample data held in your browser. No backend is connected; changes reset on reload.
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
