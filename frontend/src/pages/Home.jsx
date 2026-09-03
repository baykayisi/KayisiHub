import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI, categoriesAPI } from '../services/api';
import Loading from '../components/Loading';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [selectedGame, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsRes, categoriesRes] = await Promise.all([
        listingsAPI.getAll({ game: selectedGame || '', page, limit: 12 }),
        categoriesAPI.getAll(),
      ]);
      setListings(listingsRes.data.listings);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Gaming Marketplace</h1>
          <p className="text-indigo-100">Buy & Sell In-Game Accounts and Items</p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">Browse Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSelectedGame('');
              setPage(1);
            }}
            className={`p-4 rounded-lg font-medium transition-colors ${
              selectedGame === '' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            All Games
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedGame(cat.name);
                setPage(1);
              }}
              className={`p-4 rounded-lg font-medium transition-colors ${
                selectedGame === cat.name ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">Available Listings</h2>
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing._id}
                  to={`/listing/${listing._id}`}
                  className="card p-4 hover:shadow-xl transition-all"
                >
                  <div className="mb-2">
                    <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-semibold">
                      {listing.game}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg line-clamp-2">{listing.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 my-2">{listing.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-indigo-600">${listing.price}</span>
                    <span className="text-xs text-gray-500">{listing.views} views</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={listings.length < 12}
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
