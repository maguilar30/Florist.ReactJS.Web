export type AdminMenuIcon =
  | 'users'
  | 'star'
  | 'mail'
  | 'plus-order'
  | 'orders'
  | 'tags'
  | 'flower'
  | 'store'
  | 'percent'
  | 'truck'
  | 'heart'
  | 'settings'

export type AdminMenuItem = {
  to: string
  label: string
  icon: AdminMenuIcon
}

export type AdminMenuGroup = {
  id: string
  label: string
  icon: AdminMenuIcon
  items: AdminMenuItem[]
}

function byLabel(a: AdminMenuItem, b: AdminMenuItem) {
  return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })
}

export const ADMIN_MENU_GROUPS: AdminMenuGroup[] = [
  {
    id: 'clientes',
    label: 'Clientes',
    icon: 'users',
    items: [
      { to: '/admin/clientes', label: 'Clientes', icon: 'users' },
      { to: '/admin/estrellas', label: 'Estrellas', icon: 'star' },
      { to: '/admin/mensajes', label: 'Mensajes', icon: 'mail' },
      { to: '/admin/nuevo-pedido', label: 'Nuevo pedido', icon: 'plus-order' },
      { to: '/admin/pedidos', label: 'Pedidos', icon: 'orders' },
    ].sort(byLabel),
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: 'flower',
    items: [
      { to: '/admin/categorias', label: 'Categorías', icon: 'tags' },
      { to: '/admin/productos', label: 'Productos', icon: 'flower' },
    ].sort(byLabel),
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: 'settings',
    items: [
      { to: '/admin/contacto', label: 'Datos', icon: 'store' },
      { to: '/admin/descuentos', label: 'Descuentos', icon: 'percent' },
      { to: '/admin/envio', label: 'Envío', icon: 'truck' },
      { to: '/admin/fidelidad', label: 'Fidelidad', icon: 'heart' },
    ].sort(byLabel),
  },
]
