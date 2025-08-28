'use client';

import { useEffect, useState } from 'react';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import { 
  FiUsers, 
  FiSearch, 
  FiFilter,
  FiMail,
  FiCalendar,
  FiShoppingBag,
  FiDollarSign,
  FiEdit,
  FiShield
} from 'react-icons/fi';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
  };
  orders: {
    total: number;
  }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalRevenue = users.reduce((sum, user) => 
    sum + user.orders.reduce((orderSum, order) => orderSum + order.total, 0), 0
  );

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FiUsers className="text-orange-600" />
                    User Management
                  </h1>
                  <p className="mt-2 text-gray-600">Manage customers and their account details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiUsers className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiShield className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Admin Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiShoppingBag className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u._count.orders > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiDollarSign className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{(totalRevenue / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Customers</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const userRevenue = user.orders.reduce((sum, order) => sum + order.total, 0);
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                  <span className="text-orange-600 font-medium text-sm">
                                    {user.name?.charAt(0) || user.email.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <FiMail className="mr-1 h-3 w-3" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              <FiShield className="mr-1 h-3 w-3" />
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <FiShoppingBag className="mr-1 h-4 w-4 text-gray-400" />
                              {user._count.orders}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{(userRevenue / 100).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiCalendar className="mr-1 h-4 w-4" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <FiUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
