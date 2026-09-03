import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, listingsAPI } from '../services/api';
import Loading from '../components/Loading';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = currentUser?.id === id;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await usersAPI.getProfile(id);
      setProfile(res.data.user);
      setListings(res.data.user.listings || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!profile) return <div className="text-center py-12">Profile not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          ← Back
        </Link>

        {/* Profile Header */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              <p className="text-gray-600">{profile.email}</p>
              {profile.firstName && (
                <p className="text-sm text-gray-500 mt-1">
                  {profile.firstName} {profile.lastName}
                </p>
              )}
            </div>
            {isOwner && (
              <button className="btn-primary text-sm">Edit Profile</button>
            )}
          </div>
          {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
        </div>

        {/* User's Listings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Listings ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <div className="text-center py-12 card p-6">
              <p className="text-gray-500">No listings yet</p>
              {isOwner && (
                <Link to="/listing/new" className="btn-primary mt-4 inline-block">
                  Create Listing
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing._id}
                  to={`/listing/${listing._id}`}
                  className="card p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-bold line-clamp-2 mb-2">{listing.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{listing.game}</p>
                  <div className="flex justify-between">
                    <span className="font-bold text-indigo-600">${listing.price}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded capitalize">
                      {listing.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
