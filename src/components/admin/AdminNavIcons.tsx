import type { AdminMenuIcon } from '../../adminNav'

const paths: Record<AdminMenuIcon, string> = {
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  star: 'M12 3l2.6 5.4L20 9.3l-4 3.9.9 5.8L12 16.3 7.1 19l.9-5.8-4-3.9 5.4-.9L12 3z',
  mail: 'M4 6h16v12H4zM4 6l8 7 8-7',
  'plus-order': 'M12 5v14M5 12h14M4 20h16',
  orders: 'M7 4h10l2 4H5zM6 8h12v12H6zM9 12h6',
  tags: 'M4 7h9l7 7-7 7H4V7zM8 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  flower:
    'M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 6c0-3 4-4 4-1s-4 2-4 1zM12 6c0-3-4-4-4-1s4 2 4 1zM16 10c3 0 4 4 1 4s-2-4-1-4zM8 10c-3 0-4 4-1 4s2-4 1-4zM12 12v9M9 18h6',
  store: 'M4 8h16l-1 12H5L4 8zM4 8l2-4h12l2 4M9 12v4M15 12v4',
  percent: 'M19 5L5 19M8.5 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19.5 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  truck: 'M3 7h11v10H3zM14 11h4l3 3v3h-7zM7 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  heart:
    'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a7.7 7.7 0 0 0 .1-1.5 7.7 7.7 0 0 0-.1-1.5l2-1.5-2-3.5-2.4 1a7.4 7.4 0 0 0-2.6-1.5L14 3h-4l-.4 2.5A7.4 7.4 0 0 0 7 7l-2.4-1-2 3.5 2 1.5a7.7 7.7 0 0 0-.1 1.5 7.7 7.7 0 0 0 .1 1.5l-2 1.5 2 3.5 2.4-1a7.4 7.4 0 0 0 2.6 1.5L10 21h4l.4-2.5a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.5z',
}

export function AdminNavIcon({ name }: { name: AdminMenuIcon }) {
  return (
    <svg className="admin-menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
