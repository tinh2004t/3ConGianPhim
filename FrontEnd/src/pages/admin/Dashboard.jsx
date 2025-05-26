// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/admin/AdminLayout';
import { Film, Users, Eye, Activity, Plus, Edit3 } from 'lucide-react';
import { fetchAdminLogs } from '../../api/adminLogApi';
import movieApi from '../../api/movieApi';
import userApi from '../../api/userApi';

const Dashboard = () => {
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [topMovies, setTopMovies] = useState([]);
  const [loadingTopMovies, setLoadingTopMovies] = useState(true);

  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalViews: 0,
    activeUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

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

    const getStats = async () => {
      try {
        setLoadingStats(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        if (!token) {
          console.error('No authentication token found');
          throw new Error('Authentication required');
        }
        
        // Fetch dữ liệu từ API - sử dụng cách gọi giống MovieManagement
        const [moviesResponse, usersResponse] = await Promise.all([
          movieApi.getAll({ limit: 10000 }), // Lấy tất cả movies để tính tổng
          userApi.getAllUsers(token)
        ]);

        console.log('Movies Response:', moviesResponse);
        console.log('Users Response:', usersResponse);

        // Xử lý movies data - dựa theo cách MovieManagement xử lý
        let moviesData = [];
        if (moviesResponse?.data) {
          if (Array.isArray(moviesResponse.data.data)) {
            // Nếu có structure: { data: { data: [...] } }
            moviesData = moviesResponse.data.data;
          } else if (Array.isArray(moviesResponse.data)) {
            // Nếu có structure: { data: [...] }
            moviesData = moviesResponse.data;
          }
        }

        // Xử lý users data
        let usersData = [];
        if (Array.isArray(usersResponse?.data)) {
          usersData = usersResponse.data;
        } else if (usersResponse?.data?.users && Array.isArray(usersResponse.data.users)) {
          usersData = usersResponse.data.users;
        }

        console.log('Final Movies Data:', moviesData, 'Length:', moviesData.length);
        console.log('Final Users Data:', usersData, 'Length:', usersData.length);

        // Tính toán stats
        const totalMovies = moviesData.length || 0;
        const totalUsers = usersData.length || 0;
        
        // Debug sample movie để tìm field lượt xem
        if (moviesData.length > 0) {
          console.log('Sample movie data:', moviesData[0]);
          console.log('All movie keys:', Object.keys(moviesData[0]));
        }
        
        // Tính tổng lượt xem - kiểm tra nhiều tên field có thể
        const totalViews = Array.isArray(moviesData) 
          ? moviesData.reduce((sum, movie) => {
              // Kiểm tra các tên field có thể cho lượt xem
              const views = movie.viewCount || movie.views || movie.view_count || 
                           movie.totalViews || movie.total_views || 0;
              
              console.log(`Movie "${movie.title || movie.name}": views = ${views}`);
              
              return sum + Number(views);
            }, 0) 
          : 0;

        // Tính active users (users hoạt động trong 30 ngày qua)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsers = Array.isArray(usersData) 
          ? usersData.filter(user => {
              const lastActivity = new Date(user.lastLogin || user.updatedAt || user.createdAt);
              return lastActivity > thirtyDaysAgo;
            }).length 
          : 0;

        console.log('Calculated Stats:', {
          totalMovies,
          totalUsers,
          totalViews,
          activeUsers
        });

        setStats({
          totalMovies,
          totalUsers,
          totalViews,
          activeUsers
        });

      } catch (err) {
        console.error('Lỗi fetch stats:', err);
        setStats({
          totalMovies: 0,
          totalUsers: 0,
          totalViews: 0,
          activeUsers: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };

    getLogs();
    getTopMovies();
    getStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStats ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-2 w-24"></div>
                <div className="h-8 bg-gray-600 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard label="Tổng số phim" value={stats.totalMovies} Icon={Film} color="text-red-500" />
            <StatCard label="Tổng người dùng" value={stats.totalUsers} Icon={Users} color="text-blue-500" />
            <StatCard label="Tổng lượt xem" value={stats.totalViews} Icon={Eye} color="text-green-500" />
          </>
        )}
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
                    <p className="text-gray-400 text-sm">
                      {(movie.viewCount || movie.views || movie.view_count || 0).toLocaleString()} lượt xem
                    </p>
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