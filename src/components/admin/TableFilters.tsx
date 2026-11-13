type FilterInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export function matchesSearch(query: string, ...parts: unknown[]): boolean {
  const needle = normalize(query)
  if (!needle) return true
  return parts.some((part) => normalize(String(part ?? '')).includes(needle))
}

export function uniqueValues(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => (value ?? '').trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
}

export function TableSearch({
  id,
  value,
  onChange,
  placeholder = 'Buscar…',
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="table-toolbar">
      <label className="sr-only" htmlFor={id}>
        Buscar
      </label>
      <input
        id={id}
        className="table-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export function FilterInput({ value, onChange, placeholder = 'Filtrar', label }: FilterInputProps) {
  return (
    <input
      className="col-filter"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={label}
    />
  )
}

export function FilterSelect({
  value,
  onChange,
  options,
  allLabel = 'Todos',
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  allLabel?: string
  label: string
}) {
  return (
    <select className="col-filter" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function FilterEmpty({ query }: { query: boolean }) {
  return (
    <tr>
      <td colSpan={12} className="empty-state">
        {query ? 'Ningún resultado con esos filtros.' : 'No hay registros.'}
      </td>
    </tr>
  )
}
