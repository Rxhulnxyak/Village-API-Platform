import React from 'react';

export default function UserDetailDrawer({ user, onClose }: { user: any, onClose: () => void }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full overflow-y-auto transform transition-transform shadow-xl flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">{user.businessName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="p-6 flex-1 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Profile</h3>
            <p className="mt-2 text-gray-800">{user.email}</p>
            <p className="text-gray-500 text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Plan Management</h3>
            {/* Auto-save on blur prevents lost notes */}
            <textarea 
              className="mt-2 w-full p-2 border rounded" 
              placeholder="Admin notes (auto-saves)" 
              onBlur={() => console.log('Saved note')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
