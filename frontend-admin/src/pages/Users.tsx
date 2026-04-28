import React from 'react';
import DataTable from '../components/ui/DataTable';
import { useUsers, useUpdateUserStatus } from '../hooks/useUsers';

export default function Users() {
  const { data: users, isLoading } = useUsers();
  const { mutate: updateStatus } = useUpdateUserStatus();

  const columns = [
    { header: 'Business Name', accessorKey: 'businessName' },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Plan',
      accessorKey: 'planType',
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.original.planType === 'FREE' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-800'
        }`}>
          {row.original.planType}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.original.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          {row.original.status === 'PENDING' && (
            <button
              onClick={() => updateStatus({ userId: row.original.id, status: 'ACTIVE' })}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          )}
          {row.original.status === 'ACTIVE' && (
            <button
              onClick={() => updateStatus({ userId: row.original.id, status: 'SUSPENDED' })}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
            >
              Suspend
            </button>
          )}
           {row.original.status === 'SUSPENDED' && (
            <button
              onClick={() => updateStatus({ userId: row.original.id, status: 'ACTIVE' })}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Reactivate
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <DataTable data={users || []} columns={columns} isLoading={isLoading} />
    </div>
  );
}
