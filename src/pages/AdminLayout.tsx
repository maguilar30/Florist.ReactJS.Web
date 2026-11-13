import { Outlet } from 'react-router-dom'
import { AdminNav } from '../components/admin/AdminNav'

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <div className="container admin-shell-grid">
        <AdminNav />
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
