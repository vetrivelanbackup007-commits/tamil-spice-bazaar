'use client';

import { useEffect, useState } from 'react';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import { 
  FiSettings,
  FiSave,
  FiDollarSign,
  FiMail,
  FiShield,
  FiGlobe,
  FiPackage,
  FiTruck,
  FiCreditCard
} from 'react-icons/fi';

interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
  };
  commerce: {
    currency: string;
    taxRate: number;
    defaultCommissionRate: number;
    minimumOrderAmount: number;
    freeShippingThreshold: number;
  };
  shipping: {
    standardShippingCost: number;
    expressShippingCost: number;
    internationalShippingCost: number;
    processingDays: number;
  };
  payments: {
    razorpayEnabled: boolean;
    codEnabled: boolean;
    minimumCodAmount: number;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    general: {
      siteName: 'Tamil Spice Bazaar',
      siteDescription: 'Authentic Tamil Nadu spices and ingredients',
      contactEmail: 'contact@tamilspicebazaar.com',
      supportEmail: 'support@tamilspicebazaar.com'
    },
    commerce: {
      currency: 'INR',
      taxRate: 18,
      defaultCommissionRate: 10,
      minimumOrderAmount: 50000, // ₹500 in paise
      freeShippingThreshold: 100000 // ₹1000 in paise
    },
    shipping: {
      standardShippingCost: 5000, // ₹50 in paise
      expressShippingCost: 15000, // ₹150 in paise
      internationalShippingCost: 50000, // ₹500 in paise
      processingDays: 2
    },
    payments: {
      razorpayEnabled: true,
      codEnabled: true,
      minimumCodAmount: 20000 // ₹200 in paise
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (response.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

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
                    <FiSettings className="text-orange-600" />
                    Settings
                  </h1>
                  <p className="mt-2 text-gray-600">Configure your store settings and preferences</p>
                </div>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave />
                  )}
                  Save Settings
                </button>
              </div>
              {message && (
                <div className={`mt-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiGlobe className="text-blue-600" />
                  General Settings
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Commerce Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiDollarSign className="text-green-600" />
                  Commerce Settings
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.commerce.currency}
                    onChange={(e) => updateSetting('commerce', 'currency', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.commerce.taxRate}
                    onChange={(e) => updateSetting('commerce', 'taxRate', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.commerce.defaultCommissionRate}
                    onChange={(e) => updateSetting('commerce', 'defaultCommissionRate', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.commerce.minimumOrderAmount / 100}
                    onChange={(e) => updateSetting('commerce', 'minimumOrderAmount', parseFloat(e.target.value) * 100)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.commerce.freeShippingThreshold / 100}
                    onChange={(e) => updateSetting('commerce', 'freeShippingThreshold', parseFloat(e.target.value) * 100)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiTruck className="text-orange-600" />
                  Shipping Settings
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Shipping Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.standardShippingCost / 100}
                    onChange={(e) => updateSetting('shipping', 'standardShippingCost', parseFloat(e.target.value) * 100)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Express Shipping Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.expressShippingCost / 100}
                    onChange={(e) => updateSetting('shipping', 'expressShippingCost', parseFloat(e.target.value) * 100)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    International Shipping Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.internationalShippingCost / 100}
                    onChange={(e) => updateSetting('shipping', 'internationalShippingCost', parseFloat(e.target.value) * 100)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Days
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.processingDays}
                    onChange={(e) => updateSetting('shipping', 'processingDays', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiCreditCard className="text-purple-600" />
                  Payment Settings
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Enable Razorpay Payments
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.payments.razorpayEnabled}
                    onChange={(e) => updateSetting('payments', 'razorpayEnabled', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Enable Cash on Delivery
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.payments.codEnabled}
                    onChange={(e) => updateSetting('payments', 'codEnabled', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum COD Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.payments.minimumCodAmount / 100}
                    onChange={(e) => updateSetting('payments', 'minimumCodAmount', parseFloat(e.target.value) * 100)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
