/**
 * Generic Typed Data Table
 * TypeScript generics: TableColumn<T>[] means the render function receives a typed row.
 */
import React from 'react';
import { TableColumn } from '../../types/admin';

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends { id: string | number }>({ data, columns, isLoading, onRowClick }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b p-4 animate-pulse flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr 
              key={row.id} 
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            >
              {columns.map((col, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {col.cell ? col.cell({ row: { original: row } }) : String(row[col.accessorKey as keyof T])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
