import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchableFields?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  searchableFields = [],
  pageSize = 10,
  emptyMessage = "No records found",
  rowKey,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    if (!query || searchableFields.length === 0) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchableFields.some((f) => String(row[f] ?? "").toLowerCase().includes(q)),
    );
  }, [data, query, searchableFields]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {searchableFields.length > 0 ? (
        <div className="flex items-center gap-2 border-b p-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="pl-9"
            />
          </div>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn("px-4 py-3 font-medium", c.sortValue && "cursor-pointer select-none hover:text-foreground", c.className)}
                  onClick={() => c.sortValue && toggleSort(c.key)}
                >
                  {c.header}
                  {sortKey === c.key ? <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">{emptyMessage}</td></tr>
            ) : (
              pageRows.map((row, i) => (
                <tr key={rowKey(row)} className={cn("border-t transition-colors hover:bg-muted/30", i % 2 === 1 && "bg-muted/10")}>
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 text-foreground", c.className)}>{c.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row">
        <span>Showing {pageRows.length} of {sorted.length}</span>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1 disabled:opacity-50 hover:bg-muted" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <span className="font-mono text-xs">Page {currentPage} / {totalPages}</span>
          <button className="rounded-md border px-3 py-1 disabled:opacity-50 hover:bg-muted" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>
    </div>
  );
}
