// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/admin/AdminLayout';
import { Film, Users, Eye, Activity, Plus, Edit3 } from 'lucide-react';
import { fetchAdminLogs } from '../../api/adminLogApi';
import movieApi from '../../api/movieApi';

const Dashboard = () => {
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [topMovies, setTopMovies] = useState([]);
  const [loadingTopMovies, setLoadingTopMovies] = useState(true);

  const stats = {
    totalMovies: 1247,
    totalUsers: 8532,
    totalViews: 156789,
    activeUsers: 234
  };

  useEffect(() => {
    const getLogs = async () => {
      try {
        const data = await fetchAdminLogs();
        setRecentLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Lỗi fetchAdminLogs:', err);
        setRecentLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };

    const getTopMovies = async () => {
      try {
        const response = await movieApi.getTop();
        setTopMovies(Array.isArray(response.data) ? response.data.slice(0, 5) : []);
      } catch (err) {
        console.error('Lỗi fetch top movies:', err);
        setTopMovies([]);
      } finally {
        setLoadingTopMovies(false);
      }
    };

    getLogs();
    getTopMovies();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Tổng số phim" value={stats.totalMovies} Icon={Film} color="text-red-500" />
        <StatCard label="Tổng người dùng" value={stats.totalUsers} Icon={Users} color="text-blue-500" />
        <StatCard label="Tổng lượt xem" value={stats.totalViews} Icon={Eye} color="text-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Logs */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Admin Activity Log</h3>
          {loadingLogs ? (
            <p className="text-gray-400">Đang tải dữ liệu...</p>
          ) : (
            <div
              className="space-y-3 overflow-y-auto"
              style={{ maxHeight: '300px' }}
            >
              {recentLogs.map((log, index) => (
                <div key={log.id || `${log.adminId._id}-${index}`} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-semibold text-blue-400">{log.adminId.username}:</span> {log.action}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(log.createdAt).toLocaleDateString('vi-VN')} {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Movies */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Movies (Lượt xem)</h3>
          {loadingTopMovies ? (
            <p className="text-gray-400">Đang tải dữ liệu...</p>
          ) : (
            <div className="space-y-3">
              {topMovies.map((movie, index) => (
                <div key={movie._id || `${movie.title}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <span className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</span>
                  <img
                    src={movie.posterUrl || '/api/placeholder/60/90'}
                    alt={movie.title}
                    className="w-12 h-18 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{movie.title}</p>
                    <p className="text-gray-400 text-sm">{movie.viewCount?.toLocaleString()} lượt xem</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

const StatCard = ({ label, value, Icon, color }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
      <Icon className={`w-12 h-12 ${color}`} />
    </div>
  </div>
);


export default Dashboard;
