import React, { useState } from 'react';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import { Edit3, Search, ChevronLeft, ChevronRight, X, User, Mail, Shield } from 'lucide-react';

const Users = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    role: 'user'
  });

  // Mock data
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'john_doe',
      email: 'john.doe@example.com',
      role: 'user',
      joinDate: '2024-01-15',
      lastActive: '2024-05-20',
      status: 'active'
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane.smith@example.com',
      role: 'admin',
      joinDate: '2023-12-10',
      lastActive: '2024-05-22',
      status: 'active'
    },
    {
      id: 3,
      username: 'mike_wilson',
      email: 'mike.wilson@example.com',
      role: 'moderator',
      joinDate: '2024-02-20',
      lastActive: '2024-05-21',
      status: 'active'
    },
    {
      id: 4,
      username: 'sarah_jones',
      email: 'sarah.jones@example.com',
      role: 'user',
      joinDate: '2024-03-05',
      lastActive: '2024-05-18',
      status: 'inactive'
    },
    {
      id: 5,
      username: 'david_brown',
      email: 'david.brown@example.com',
      role: 'user',
      joinDate: '2024-01-30',
      lastActive: '2024-05-19',
      status: 'active'
    },
    {
      id: 6,
      username: 'lisa_davis',
      email: 'lisa.davis@example.com',
      role: 'moderator',
      joinDate: '2024-02-14',
      lastActive: '2024-05-17',
      status: 'active'
    }
  ]);

  const itemsPerPage = 10;
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleUserSubmit = () => {
    if (showEditForm) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userFormData }
          : user
      ));
      setShowEditForm(false);
      setEditingUser(null);
    }
    setUserFormData({
      username: '',
      email: '',
      role: 'user'
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      role: user.role
    });
    setShowEditForm(true);
  };

  const closeAllForms = () => {
    setShowEditForm(false);
    setEditingUser(null);
    setUserFormData({
      username: '',
      email: '',
      role: 'user'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white';
      case 'moderator':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Quản lý người dùng</h2>
        </div>

        {/* Search */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Hoạt động cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-300">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role === 'admin' ? 'Quản trị viên' : 
                         user.role === 'moderator' ? 'Điều hành viên' : 'Người dùng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.lastActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm transition-colors inline-flex items-center"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <div className="text-gray-400">
            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredUsers.length)} của {filteredUsers.length} người dùng
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 bg-gray-700 text-white rounded">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit User Form Modal */}
        {showEditForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Chỉnh sửa người dùng
                </h3>
                <button
                  onClick={closeAllForms}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tên người dùng</label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nhập tên người dùng"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vai trò</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="user">Người dùng</option>
                    <option value="moderator">Điều hành viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleUserSubmit}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors"
                  >
                    Cập nhật
                  </button>
                  <button
                    onClick={closeAllForms}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default Users;