'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DebugAdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch all users to check admin user exists
    fetch('/api/debug/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Debug Page</h1>
        
        {/* Session Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User ID:</strong> {session?.user?.id || 'Not logged in'}</p>
            <p><strong>Email:</strong> {session?.user?.email || 'Not logged in'}</p>
            <p><strong>Name:</strong> {session?.user?.name || 'Not logged in'}</p>
            <p><strong>Role:</strong> {session?.user?.role || 'No role'}</p>
            <p><strong>Is Admin:</strong> {session?.user?.role === 'ADMIN' ? 'YES' : 'NO'}</p>
          </div>
        </div>

        {/* Users in Database */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users in Database</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = '/admin/login'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Admin Login
            </button>
            <button 
              onClick={() => window.location.href = '/admin'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
            >
              Try Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
