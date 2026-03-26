"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  pageSize?: number;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends object>({
  data,
  columns,
  searchKeys = [],
  pageSize = 15,
  actions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) =>
        String((row as any)[k as string] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String((a as any)[sortKey] ?? "");
      const bv = String((b as any)[sortKey] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Filtrer…"
          value={query}
          onChange={handleSearch}
          className="pl-9 h-9 bg-muted/40 border-border/60 text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              {columns.map((col) => (
                <TableHead
                  key={col.key as string}
                  className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 ${
                    col.sortable
                      ? "cursor-pointer hover:text-foreground select-none"
                      : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-primary">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </span>
                </TableHead>
              ))}
              {actions && (
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-16 text-muted-foreground text-sm"
                >
                  Aucun résultat
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-muted/30 border-b border-border/40 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key as string} className="py-3 text-sm">
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key as string] ?? "—")}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="py-3 text-right">
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {sorted.length} résultat{sorted.length > 1 ? "s" : ""} · Page{" "}
            {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
