import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchLoyaltyMembers } from '../api/loyalty'
import { ApiError } from '../api/client'
import { FilterEmpty, FilterInput, TableSearch, matchesSearch } from '../components/admin/TableFilters'
import { Spinner } from '../components/ui/Spinner'
import { formatMoney } from '../money'
import type { LoyaltyMember } from '../types'

export function LoyaltyMembersAdminPage() {
  const [members, setMembers] = useState<LoyaltyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [starsFilter, setStarsFilter] = useState('')
  const [ordersFilter, setOrdersFilter] = useState('')
  const [spentFilter, setSpentFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setMembers(await fetchLoyaltyMembers())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar los clientes con estrellas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    return members.filter(
      (row) =>
        matchesSearch(
          search,
          row.fullName,
          row.email,
          row.phone,
          row.stars,
          row.orderCount,
          formatMoney(row.totalSpent),
          row.totalSpent,
        ) &&
        matchesSearch(nameFilter, row.fullName) &&
        matchesSearch(emailFilter, row.email) &&
        matchesSearch(starsFilter, row.stars) &&
        matchesSearch(ordersFilter, row.orderCount) &&
        matchesSearch(spentFilter, formatMoney(row.totalSpent), row.totalSpent),
    )
  }, [members, search, nameFilter, emailFilter, starsFilter, ordersFilter, spentFilter])

  const hasFilters = Boolean(search || nameFilter || emailFilter || starsFilter || ordersFilter || spentFilter)
  const totalStars = members.reduce((sum, row) => sum + row.stars, 0)
  const totalSpent = members.reduce((sum, row) => sum + row.totalSpent, 0)

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Clientes con estrellas</h2>
          <p>
            Cuentas registradas que ya tienen al menos una estrella (pedido entregado). Incluye cuántos pedidos tienen y
            cuánto han gastado en entregas.
          </p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="card admin-table-wrap">
          {loading ? (
            <Spinner label="Cargando clientes…" />
          ) : members.length === 0 ? (
            <p className="empty-state">Todavía no hay clientes con estrellas de fidelidad.</p>
          ) : (
            <>
              <p className="cart-note">
                {`${members.length} cliente${members.length === 1 ? '' : 's'} · ${totalStars} estrella${totalStars === 1 ? '' : 's'} · ${formatMoney(totalSpent)} entregados`}
              </p>
              <TableSearch
                id="loyalty-members-search"
                value={search}
                onChange={setSearch}
                placeholder="Buscar por nombre, correo, estrellas, pedidos o gasto…"
              />
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Correo</th>
                      <th>Estrellas</th>
                      <th>Pedidos</th>
                      <th>Gastado</th>
                    </tr>
                    <tr className="filter-row">
                      <th>
                        <FilterInput
                          value={nameFilter}
                          onChange={setNameFilter}
                          placeholder="Nombre"
                          label="Filtrar nombre"
                        />
                      </th>
                      <th>
                        <FilterInput
                          value={emailFilter}
                          onChange={setEmailFilter}
                          placeholder="Correo"
                          label="Filtrar correo"
                        />
                      </th>
                      <th>
                        <FilterInput
                          value={starsFilter}
                          onChange={setStarsFilter}
                          placeholder="Estrellas"
                          label="Filtrar estrellas"
                        />
                      </th>
                      <th>
                        <FilterInput
                          value={ordersFilter}
                          onChange={setOrdersFilter}
                          placeholder="Pedidos"
                          label="Filtrar pedidos"
                        />
                      </th>
                      <th>
                        <FilterInput
                          value={spentFilter}
                          onChange={setSpentFilter}
                          placeholder="Gastado"
                          label="Filtrar gastado"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <FilterEmpty query={hasFilters} />
                    ) : (
                      filtered.map((row) => (
                        <tr key={row.userId}>
                          <td>
                            <strong>{row.fullName}</strong>
                            {row.phone ? <div className="muted-cell">{row.phone}</div> : null}
                          </td>
                          <td>{row.email}</td>
                          <td>{row.stars}</td>
                          <td>{row.orderCount}</td>
                          <td>{formatMoney(row.totalSpent)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
