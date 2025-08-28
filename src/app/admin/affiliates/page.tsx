'use client';

import { useEffect, useState } from 'react';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import { 
  FiUsers, 
  FiDollarSign,
  FiTrendingUp,
  FiLink,
  FiEye,
  FiCalendar,
  FiSearch,
  FiDownload,
  FiCreditCard
} from 'react-icons/fi';

interface Affiliate {
  id: string;
  userId: string;
  promoCode: string;
  commissionRate: number;
  totalEarnings: number;
  totalClicks: number;
  totalOrders: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface AffiliateStats {
  totalAffiliates: number;
  totalCommissions: number;
  totalClicks: number;
  totalOrders: number;
  pendingPayouts: number;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingPayouts, setProcessingPayouts] = useState<string[]>([]);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const response = await fetch('/api/admin/affiliates');
      const data = await response.json();
      
      if (response.ok) {
        setAffiliates(data.affiliates);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch affiliates:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayout = async (affiliateId: string) => {
    setProcessingPayouts(prev => [...prev, affiliateId]);
    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}/payout`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchAffiliates();
      }
    } catch (error) {
      console.error('Failed to process payout:', error);
    } finally {
      setProcessingPayouts(prev => prev.filter(id => id !== affiliateId));
    }
  };

  const filteredAffiliates = affiliates.filter(affiliate => 
    affiliate.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.promoCode.toLowerCase().includes(searchTerm.toLowerCase())
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
                    Affiliate Management
                  </h1>
                  <p className="mt-2 text-gray-600">Manage affiliate partners and commission payouts</p>
                </div>
                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <FiDownload className="mr-2" />
                    Export Report
                  </button>
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
                  <p className="text-sm font-medium text-gray-500">Total Affiliates</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.totalAffiliates || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiDollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Commissions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{((stats?.totalCommissions || 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiTrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.totalClicks || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiCreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{((stats?.pendingPayouts || 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search affiliates by name, email, or promo code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Affiliates Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affiliate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promo Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
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
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAffiliates.length > 0 ? (
                    filteredAffiliates.map((affiliate) => (
                      <tr key={affiliate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <span className="text-orange-600 font-medium text-sm">
                                  {affiliate.user.name?.charAt(0) || affiliate.user.email.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {affiliate.user.name || 'No name'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {affiliate.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiLink className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {affiliate.promoCode}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {affiliate.commissionRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <FiEye className="mr-1 h-3 w-3" />
                              {affiliate.totalClicks} clicks
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <FiTrendingUp className="mr-1 h-3 w-3" />
                              {affiliate.totalOrders} orders
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{(affiliate.totalEarnings / 100).toFixed(2)}
                          </div>
                          {affiliate.totalEarnings > 0 && (
                            <div className="text-xs text-green-600">
                              Pending payout
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1 h-4 w-4" />
                            {new Date(affiliate.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {affiliate.totalEarnings > 0 && (
                            <button
                              onClick={() => processPayout(affiliate.id)}
                              disabled={processingPayouts.includes(affiliate.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 flex items-center gap-1"
                            >
                              {processingPayouts.includes(affiliate.id) ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <FiCreditCard className="w-3 h-3" />
                              )}
                              Pay Out
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <FiUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No affiliates found</p>
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
