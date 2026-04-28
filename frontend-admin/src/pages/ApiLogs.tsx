import React from 'react';

export default function ApiLogs() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">API Logs</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700">
          Export CSV
        </button>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center h-64 text-gray-500">
        Log streaming interface will appear here.
      </div>
    </div>
  );
}
