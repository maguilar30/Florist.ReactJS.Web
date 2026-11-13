import { NavLink } from 'react-router-dom'
import { ADMIN_MENU } from '../../adminNav'

export function AdminNav() {
  return (
    <nav className="admin-menu" aria-label="Administración">
      <p className="admin-menu-title">Administración</p>
      {ADMIN_MENU.map((item) => (
        <NavLink key={item.to} to={item.to}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
