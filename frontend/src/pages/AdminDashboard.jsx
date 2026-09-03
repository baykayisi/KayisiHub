import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import Loading from '../components/Loading';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-indigo-600">{stats?.stats.totalUsers}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Total Listings</p>
            <p className="text-3xl font-bold text-indigo-600">{stats?.stats.totalListings}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Active Listings</p>
            <p className="text-3xl font-bold text-green-600">{stats?.stats.activeListings}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Admin Users</p>
            <p className="text-3xl font-bold text-purple-600">{stats?.stats.adminCount}</p>
          </div>
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Recent Users</h2>
            <div className="space-y-3">
              {stats?.recent.users.map((u) => (
                <div key={u._id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{u.username}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Recent Listings</h2>
            <div className="space-y-3">
              {stats?.recent.listings.map((l) => (
                <div key={l._id} className="py-2 border-b">
                  <p className="font-medium line-clamp-1">{l.title}</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{l.game}</span>
                    <span>${l.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
