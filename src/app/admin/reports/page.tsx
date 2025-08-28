'use client';

import { useEffect, useState } from 'react';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import { 
  FiBarChart,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiShoppingBag,
  FiCalendar,
  FiDownload,
  FiFilter
} from 'react-icons/fi';

interface ReportData {
  salesReport: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
  };
  productReport: {
    topProducts: Array<{
      id: string;
      name: string;
      totalSold: number;
      revenue: number;
    }>;
    lowStockProducts: Array<{
      id: string;
      name: string;
      stock: number;
    }>;
  };
  customerReport: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerGrowth: number;
  };
  affiliateReport: {
    totalAffiliates: number;
    totalCommissions: number;
    topAffiliates: Array<{
      id: string;
      promoCode: string;
      earnings: number;
      orders: number;
    }>;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [reportType, setReportType] = useState('overview');

  // Simple SVG line path generator for sparkline charts (no external deps)
  const buildLinePath = (values: number[], width: number, height: number, pad = 8) => {
    const n = values.length;
    if (n === 0) return '';
    const max = Math.max(1, ...values);
    const min = 0;
    const innerW = width - 2 * pad;
    const innerH = height - 2 * pad;
    const xStep = n > 1 ? innerW / (n - 1) : innerW;
    const scaleY = (v: number) => height - pad - ((v - min) / (max - min)) * innerH;
    const points = values.map((v, i) => [pad + i * xStep, scaleY(v)] as const);
    return 'M ' + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ');
  };

  const chartWidth = 360;
  const revenueSeries = (reportData?.monthlyData ?? []).map((m) => m.revenue);
  const ordersSeries = (reportData?.monthlyData ?? []).map((m) => m.orders);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/admin/reports?days=${dateRange}`);
      const data = await response.json();
      
      if (response.ok) {
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/reports/export?type=${type}&days=${dateRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  // Safe numeric fallbacks for growth metrics
  const revenueGrowth = reportData?.salesReport?.revenueGrowth ?? 0;
  const ordersGrowth = reportData?.salesReport?.ordersGrowth ?? 0;
  const customerGrowth = reportData?.customerReport?.customerGrowth ?? 0;

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminProtectedRoute>
    );
  }

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
                    <FiBarChart className="text-orange-600" />
                    Reports & Analytics
                  </h1>
                  <p className="mt-2 text-gray-600">Business insights and performance metrics</p>
                </div>
                <div className="flex space-x-3">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                  <button 
                    onClick={() => exportReport('overview')}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <FiDownload className="mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiDollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{((reportData?.salesReport.totalRevenue || 0) / 100).toFixed(2)}
                  </p>
                  <p className={`text-sm ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiShoppingBag className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData?.salesReport.totalOrders || 0}
                  </p>
                  <p className={`text-sm ${ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ordersGrowth > 0 ? '+' : ''}{ordersGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiUsers className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">New Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData?.customerReport.newCustomers || 0}
                  </p>
                  <p className={`text-sm ${customerGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {customerGrowth > 0 ? '+' : ''}{customerGrowth.toFixed(1)}%
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
                  <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{((reportData?.salesReport.averageOrderValue || 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(reportData?.productReport?.topProducts ?? []).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(product.revenue / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Affiliates */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Affiliates</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(reportData?.affiliateReport?.topAffiliates ?? []).map((affiliate, index) => (
                    <div key={affiliate.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{affiliate.promoCode}</p>
                          <p className="text-xs text-gray-500">{affiliate.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(affiliate.earnings / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          {(reportData?.productReport?.lowStockProducts ?? []).length > 0 && (
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 text-red-600">
                  Low Stock Alert
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(reportData?.productReport?.lowStockProducts ?? []).map((product) => (
                    <div key={product.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-red-600">Only {product.stock} left in stock</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
            </div>
            <div className="p-6">
              {/* Inline charts (responsive via viewBox) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 flex items-center gap-2"><FiTrendingUp className="text-orange-600" /> Revenue</span>
                    <span className="text-sm font-medium text-gray-900">₹{(((revenueSeries[revenueSeries.length - 1] ?? 0)) / 100).toFixed(2)}</span>
                  </div>
                  <svg width="100%" height="100" viewBox={`0 0 ${chartWidth} 100`} preserveAspectRatio="none" className="block">
                    <path d={buildLinePath(revenueSeries, chartWidth, 100)} stroke="#ea580c" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 flex items-center gap-2"><FiShoppingBag className="text-blue-600" /> Orders</span>
                    <span className="text-sm font-medium text-gray-900">{ordersSeries[ordersSeries.length - 1] ?? 0}</span>
                  </div>
                  <svg width="100%" height="100" viewBox={`0 0 ${chartWidth} 100`} preserveAspectRatio="none" className="block">
                    <path d={buildLinePath(ordersSeries, chartWidth, 100)} stroke="#2563eb" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Month</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Revenue</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Orders</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Customers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData?.monthlyData ?? []).map((month) => (
                      <tr key={month.month} className="border-b border-gray-100">
                        <td className="py-3 text-sm text-gray-900">{month.month}</td>
                        <td className="py-3 text-sm text-gray-900">₹{(month.revenue / 100).toFixed(2)}</td>
                        <td className="py-3 text-sm text-gray-900">{month.orders}</td>
                        <td className="py-3 text-sm text-gray-900">{month.customers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
