import type { ReactNode } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export type TableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type ApiDataTableProps<T> = {
  title?: string;
  className?: string;
  rows: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

export default function ApiDataTable<T>({
  title,
  className,
  rows,
  columns,
  rowKey,
  loading = false,
  error = null,
  emptyMessage = "No records found.",
}: ApiDataTableProps<T>) {
  return (
    <div className={className ?? "flex flex-col"}>
      {title ? (
        <div className="eoc-panel-header">
          <span>{title}</span>
        </div>
      ) : null}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="border-t border-border p-4 text-sm text-destructive">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="border-t border-border p-4 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="eoc-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className={column.className}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={rowKey(row, index)}>
                  {columns.map((column) => (
                    <td key={column.header} className={column.className}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}