import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  isLoading?: boolean
  pageSize?: number
  emptyMessage?: string
  filters?: React.ReactNode
  getRowClassName?: (row: T) => string
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b border-zinc-100">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-4 bg-zinc-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  searchable,
  searchPlaceholder = 'Buscar...',
  onSearch,
  isLoading,
  pageSize = 10,
  emptyMessage = 'Nenhum registro encontrado',
  filters,
  getRowClassName,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const filteredData = onSearch ? data : data.filter((row) =>
    search === '' || JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  )

  const total = filteredData.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const paginated = filteredData.slice(start, start + pageSize)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
    onSearch?.(value)
  }

  return (
    <div className="bg-white rounded-2xl beautiful-shadow overflow-hidden">
      {/* Toolbar */}
      {(searchable || filters) && (
        <div className="flex flex-col sm:flex-row gap-3 px-4 py-3 border-b border-zinc-100">
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          )}
          {filters && <div className="flex gap-2">{filters}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3 ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <Skeleton />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-zinc-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className={`border-b border-zinc-50 hover:bg-zinc-50/60 transition-colors ${getRowClassName?.(row) ?? ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-6 py-3.5 text-sm text-zinc-700 ${col.className ?? ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            {start + 1}–{Math.min(start + pageSize, total)} de {total} registros
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-600" />
            </button>
            <span className="text-xs text-zinc-600 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
