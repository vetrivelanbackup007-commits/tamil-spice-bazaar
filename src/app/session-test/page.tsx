'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function SessionTest() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Email:</strong> {session?.user?.email || 'None'}</p>
            <p><strong>Name:</strong> {session?.user?.name || 'None'}</p>
            <p><strong>Role:</strong> {session?.user?.role || 'None'}</p>
            <p><strong>User ID:</strong> {session?.user?.id || 'None'}</p>
          </div>
          
          <div className="mt-6 space-x-4">
            {!session ? (
              <button 
                onClick={() => signIn('google')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign In
              </button>
            ) : (
              <button 
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            )}
            
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Refresh Page
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Access Test</h2>
          <div className="space-y-4">
            <p className={`p-3 rounded ${
              session?.user?.role === 'ADMIN' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {session?.user?.role === 'ADMIN' ? '✅ You have ADMIN access' : '❌ No ADMIN access'}
            </p>
            
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/admin'}
                className={`px-4 py-2 rounded ${
                  session?.user?.role === 'ADMIN'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={session?.user?.role !== 'ADMIN'}
              >
                Go to Admin Dashboard
              </button>
              
              <button 
                onClick={() => window.location.href = '/admin-direct'}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to Direct Admin
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
            <li>Check your current session status above</li>
            <li>If not signed in, click "Sign In" and use vetrivelanbackup007@gmail.com</li>
            <li>After signing in, check if Role shows "ADMIN"</li>
            <li>If Role is ADMIN, try "Go to Admin Dashboard"</li>
            <li>If it still redirects, there's a session timing issue</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
