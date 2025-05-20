import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { getMe } from '../api/userApi';

const Account = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = await getMe(token);
        console.log('User data:', userData); // kiểm tra lại
        setUser(userData);
      } catch (error) {
        console.error('Lỗi khi gọi API /users/me:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <div className="text-center mt-10">User not found or not logged in.</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-4 md:mb-0 md:mr-6">
                <img
                  src="/default-avatar.png"
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">{user.username}</h3>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-gray-600">
                  Member since: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Watching History</h3>
            {user.history && user.history.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {user.history.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No watching history available.</p>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Favorites</h3>
            {user.favorites && user.favorites.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {user.favorites.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No favorites added yet.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (

    <div className="container mx-auto px-4 py-8 pt-20">
      <h1 className="text-3xl font-bold mb-8 text-center">My Account</h1>

      <div className="flex flex-wrap border-b mb-6">
        {['profile', 'history', 'favorites'].map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 font-medium ${activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-500'
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Account;
