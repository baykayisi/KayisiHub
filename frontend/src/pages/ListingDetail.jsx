import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import Loading from '../components/Loading';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await listingsAPI.getById(id);
      setListing(res.data.listing);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!listing) return <div className="text-center py-12">Listing not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          ← Back to Listings
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="card p-6">
              <div className="mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded font-semibold text-sm">
                  {listing.game}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
              <p className="text-gray-600 mb-6">{listing.description}</p>

              {listing.specifications && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-bold mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {listing.specifications.level && (
                      <div>
                        <span className="text-gray-600">Level:</span> {listing.specifications.level}
                      </div>
                    )}
                    {listing.specifications.region && (
                      <div>
                        <span className="text-gray-600">Region:</span> {listing.specifications.region}
                      </div>
                    )}
                    {listing.specifications.skinCount && (
                      <div>
                        <span className="text-gray-600">Skins:</span> {listing.specifications.skinCount}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card p-6 sticky top-20">
              <div className="text-4xl font-bold text-indigo-600 mb-6">${listing.price}</div>

              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <p className="font-semibold capitalize">
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {listing.status}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-3">Seller Information</h3>
                {listing.seller && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">{listing.seller.username}</p>
                    <p className="text-sm text-gray-600">{listing.seller.email}</p>
                    <Link
                      to={`/profile/${listing.seller._id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block"
                    >
                      View Profile →
                    </Link>
                  </div>
                )}
              </div>

              <button className="w-full btn-primary mb-2">
                Contact Seller
              </button>
              <p className="text-xs text-gray-500 text-center">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
