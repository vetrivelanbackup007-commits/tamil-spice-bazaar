'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiDollarSign, FiUsers, FiTrendingUp, FiCopy, FiExternalLink } from 'react-icons/fi';

interface AffiliateData {
  id: string;
  promoCode: string;
  totalEarnings: number;
  stats: {
    totalClicks: number;
    monthlyClicks: number;
    totalEarnings: number;
  };
  clicks: Array<{
    id: string;
    createdAt: string;
  }>;
}

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/affiliate');
      return;
    }

    fetchAffiliate();
  }, [session, status]);

  const fetchAffiliate = async () => {
    try {
      const response = await fetch('/api/affiliates');
      const data = await response.json();
      
      if (response.ok) {
        setAffiliate(data.affiliate);
      } else if (response.status === 404) {
        // No affiliate account exists
        setAffiliate(null);
      } else {
        throw new Error(data.error || 'Failed to fetch affiliate data');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const registerAffiliate = async () => {
    setRegistering(true);
    setError('');
    
    try {
      const response = await fetch('/api/affiliates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }
      
      await fetchAffiliate();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setRegistering(false);
    }
  };

  const copyAffiliateLink = () => {
    if (!affiliate) return;
    
    const link = `${window.location.origin}?ref=${affiliate.promoCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <FiDollarSign className="mx-auto text-6xl text-orange-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Our Affiliate Program</h1>
              <p className="text-gray-600 text-lg">
                Earn commission by promoting premium Tamil Nadu spices
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 border rounded-lg">
                <FiDollarSign className="text-2xl text-green-500 mb-2" />
                <h3 className="font-semibold mb-1">Earn Commission</h3>
                <p className="text-sm text-gray-600">Get paid for every sale through your referral link</p>
              </div>
              <div className="p-4 border rounded-lg">
                <FiUsers className="text-2xl text-blue-500 mb-2" />
                <h3 className="font-semibold mb-1">Track Performance</h3>
                <p className="text-sm text-gray-600">Monitor clicks, conversions, and earnings in real-time</p>
              </div>
              <div className="p-4 border rounded-lg">
                <FiTrendingUp className="text-2xl text-purple-500 mb-2" />
                <h3 className="font-semibold mb-1">Grow Together</h3>
                <p className="text-sm text-gray-600">Help us share authentic Tamil spices with the world</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              onClick={registerAffiliate}
              disabled={registering}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {registering ? 'Creating Account...' : 'Become an Affiliate'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Affiliate Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your performance and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{(affiliate.stats.totalEarnings / 100).toFixed(2)}
                </p>
              </div>
              <FiDollarSign className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-blue-600">{affiliate.stats.totalClicks}</p>
              </div>
              <FiUsers className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">{affiliate.stats.monthlyClicks}</p>
              </div>
              <FiTrendingUp className="text-3xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Affiliate Link */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Affiliate Link</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 p-3 bg-gray-100 rounded-md font-mono text-sm">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/shop?ref=${affiliate.promoCode}`}
            </div>
            <button
              onClick={copyAffiliateLink}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-3 rounded-md hover:bg-orange-600 transition-colors"
            >
              <FiCopy />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Share this link to earn commission on every sale. Your promo code: <strong>{affiliate.promoCode}</strong>
          </p>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Clicks</h2>
          {affiliate.clicks.length > 0 ? (
            <div className="space-y-2">
              {affiliate.clicks.map((click) => (
                <div key={click.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-2">
                    <FiExternalLink className="text-gray-400" />
                    <span className="text-sm">Click recorded</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(click.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No clicks recorded yet. Start sharing your affiliate link!</p>
          )}
        </div>
      </div>
    </div>
  );
}
