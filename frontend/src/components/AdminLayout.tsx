import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/admin/analytics',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    label: '分析',
  },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] gap-0">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-gray-50/50 p-4 lg:block">
        <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          管理后台
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile tab bar */}
      <div className="flex gap-1 border-b border-gray-200 bg-white px-4 lg:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6">
        <Outlet />
      </div>
    </div>
  );
}
