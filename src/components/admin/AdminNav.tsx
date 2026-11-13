import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ADMIN_MENU_GROUPS } from '../../adminNav'
import { AdminNavIcon } from './AdminNavIcons'

function groupForPath(pathname: string) {
  return ADMIN_MENU_GROUPS.find((group) => group.items.some((item) => pathname.startsWith(item.to)))?.id
}

export function AdminNav() {
  const { pathname } = useLocation()
  const [openIds, setOpenIds] = useState<string[]>(() => {
    const current = groupForPath(pathname)
    return [current ?? ADMIN_MENU_GROUPS[0].id]
  })

  useEffect(() => {
    const current = groupForPath(pathname)
    if (!current) return
    setOpenIds((ids) => (ids.includes(current) ? ids : [...ids, current]))
  }, [pathname])

  function toggle(id: string) {
    setOpenIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]))
  }

  return (
    <nav className="admin-menu" aria-label="Administración">
      <p className="admin-menu-title">Administración</p>
      {ADMIN_MENU_GROUPS.map((group) => {
        const open = openIds.includes(group.id)
        const panelId = `admin-menu-${group.id}`
        return (
          <div key={group.id} className={`admin-menu-group${open ? ' is-open' : ''}`}>
            <button
              type="button"
              className="admin-menu-toggle"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(group.id)}
            >
              <AdminNavIcon name={group.icon} />
              <span>{group.label}</span>
              <svg
                className="admin-menu-chevron"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {open && (
              <div id={panelId} className="admin-menu-items">
                {group.items.map((item) => (
                  <NavLink key={item.to} to={item.to}>
                    <AdminNavIcon name={item.icon} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
