'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function TestAdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/debug/users')
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/test-admin' });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/test-admin' });
  };

  const testAdminAccess = () => {
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Access Test</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${status === 'authenticated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status}</span></p>
              <p><strong>Email:</strong> {session?.user?.email || 'Not signed in'}</p>
              <p><strong>Name:</strong> {session?.user?.name || 'Not signed in'}</p>
              <p><strong>Role:</strong> <span className={`px-2 py-1 rounded ${session?.user?.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{session?.user?.role || 'No role'}</span></p>
            </div>
            <div>
              <p><strong>Can Access Admin:</strong> <span className={`px-2 py-1 rounded ${session?.user?.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{session?.user?.role === 'ADMIN' ? 'YES' : 'NO'}</span></p>
              <p><strong>User ID:</strong> {session?.user?.id || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            {!session ? (
              <button 
                onClick={handleSignIn}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign In with Google
              </button>
            ) : (
              <button 
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            )}
            
            <button 
              onClick={testAdminAccess}
              className={`px-4 py-2 rounded ${
                session?.user?.role === 'ADMIN' 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={session?.user?.role !== 'ADMIN'}
            >
              Test Admin Access
            </button>
          </div>
        </div>

        {/* Users in Database */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users in Database</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id} className={user.email === session?.user?.email ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                        {user.email === session?.user?.email && <span className="ml-2 text-blue-600 font-semibold">(You)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email === 'vetrivelanbackup007@gmail.com' ? 'Target Admin User' : 'Regular User'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No users found or API error</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Check if you're signed in above</li>
            <li>If not signed in, click "Sign In with Google" and use vetrivelanbackup007@gmail.com</li>
            <li>After signing in, check if your role shows as "ADMIN"</li>
            <li>If role is ADMIN, click "Test Admin Access" to go to dashboard</li>
            <li>If role is not ADMIN, the user needs to be updated in the database</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
