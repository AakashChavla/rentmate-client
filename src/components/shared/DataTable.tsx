'use client';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}
interface RowProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
}
interface Props<T> extends RowProps<T> {
  hasNext: boolean;
  nextCursor: string | null;
  onLoadMore: (cursor: string) => void;
  caption: string;
}
function Rows<T>({ columns, rows, rowKey, loading = false }: RowProps<T>): React.JSX.Element {
  const t = useTranslations();
  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow key={rowKey(row)}>
          {columns.map((column) => (
            <TableCell key={column.key}>{column.render(row)}</TableCell>
          ))}
        </TableRow>
      ))}
      {!rows.length ? (
        <TableRow>
          <TableCell colSpan={columns.length} className="py-12 text-center text-muted-foreground">
            {loading ? <Skeleton className="mx-auto h-6 w-40" /> : t('common.emptyTable')}
          </TableCell>
        </TableRow>
      ) : null}
    </TableBody>
  );
}
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  hasNext,
  nextCursor,
  onLoadMore,
  loading = false,
  caption,
}: Props<T>): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <Rows columns={columns} rows={rows} rowKey={rowKey} loading={loading} />
        </Table>
      </div>
      {hasNext && nextCursor ? (
        <div className="flex justify-center border-t border-border p-4">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => {
              onLoadMore(nextCursor);
            }}
          >
            {t('common.loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
