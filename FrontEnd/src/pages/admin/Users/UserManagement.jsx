import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import { Edit3, Search, ChevronLeft, ChevronRight, X, User, Mail, Shield, Trash2, AlertTriangle, MoreVertical } from 'lucide-react';
import userApi from '../../../api/userApi';

const Users = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    role: 'user'
  });

  const [users, setUsers] = useState([]);

  // Lấy token từ localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Load users khi component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      if (!token) {
        setError('Vui lòng đăng nhập để tiếp tục');
        return;
      }
      
      const response = await userApi.getAllUsers(token);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 10;
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleUserSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      
      if (!userFormData.username || !userFormData.email) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }

      if (editingUser) {
        await userApi.updateUser(editingUser._id, userFormData, token);
        setSuccess('Cập nhật người dùng thành công!');
      }
      
      await loadUsers();
      closeAllForms();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error submitting user:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user'
    });
    setShowEditForm(true);
    setError('');
    setActiveDropdown(null);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setActiveDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      
      await userApi.deleteUser(userToDelete._id, token);
      setSuccess('Xóa người dùng thành công!');
      await loadUsers();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Không thể xóa người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const closeAllForms = () => {
    setShowEditForm(false);
    setEditingUser(null);
    setShowDeleteConfirm(false);
    setUserToDelete(null);
    setUserFormData({
      username: '',
      email: '',
      role: 'user'
    });
    setError('');
  };

  const toggleDropdown = (userId) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'moderator':
        return 'Điều hành viên';
      default:
        return 'Người dùng';
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Quản lý người dùng</h2>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-600 text-white p-3 lg:p-4 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm lg:text-base">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-600 text-white p-3 lg:p-4 rounded-lg">
          <span className="text-sm lg:text-base">{success}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 lg:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 lg:pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm lg:text-base"
          />
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-white"></div>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">Đang tải...</p>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
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
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cập nhật cuối
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    {loading ? 'Đang tải...' : 'Không tìm thấy người dùng nào'}
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-750">
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
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleEdit(user)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm transition-colors inline-flex items-center"
                          disabled={loading}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm transition-colors inline-flex items-center"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {currentUsers.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400">
              {loading ? 'Đang tải...' : 'Không tìm thấy người dùng nào'}
            </p>
          </div>
        ) : (
          currentUsers.map((user) => (
            <div key={user._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{user.username}</h3>
                    <div className="flex items-center mt-1">
                      <Mail className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                      <p className="text-sm text-gray-300 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Actions Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => toggleDropdown(user._id)}
                    className="p-2 text-gray-400 hover:text-white"
                    disabled={loading}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {activeDropdown === user._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <button
                          onClick={() => handleEdit(user)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 flex items-center"
                          disabled={loading}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 flex items-center"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div>
                  <span className="block">Ngày tạo:</span>
                  <span className="text-gray-300">{formatDate(user.createdAt)}</span>
                </div>
                <div>
                  <span className="block">Cập nhật:</span>
                  <span className="text-gray-300">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-gray-400 text-sm lg:text-base text-center sm:text-left">
          Hiển thị {filteredUsers.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredUsers.length)} của {filteredUsers.length} người dùng
        </div>
        <div className="flex justify-center sm:justify-end space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 text-sm lg:text-base"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-2 bg-gray-700 text-white rounded text-sm lg:text-base">
            {totalPages === 0 ? 0 : currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0 || loading}
            className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 text-sm lg:text-base"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit User Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg lg:text-xl font-bold text-white">
                Chỉnh sửa người dùng
              </h3>
              <button
                onClick={closeAllForms}
                className="text-gray-400 hover:text-white p-1"
                disabled={loading}
              >
                <X className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tên người dùng</label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm lg:text-base"
                  placeholder="Nhập tên người dùng"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm lg:text-base"
                  placeholder="Nhập email"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vai trò</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm lg:text-base"
                  disabled={loading}
                >
                  <option value="user">Người dùng</option>
                  <option value="moderator">Điều hành viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleUserSubmit}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
                <button
                  onClick={closeAllForms}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg lg:text-xl font-bold text-white">
                Xác nhận xóa
              </h3>
              <button
                onClick={closeAllForms}
                className="text-gray-400 hover:text-white p-1"
                disabled={loading}
              >
                <X className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-start mb-4">
                <AlertTriangle className="w-8 h-8 lg:w-12 lg:h-12 text-red-500 mr-3 lg:mr-4 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm lg:text-base">Bạn có chắc chắn muốn xóa người dùng này?</p>
                  <p className="text-gray-400 text-xs lg:text-sm">Hành động này không thể hoàn tác.</p>
                </div>
              </div>
              
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-white text-sm lg:text-base"><strong>Tên:</strong> {userToDelete.username}</p>
                <p className="text-gray-300 text-sm lg:text-base"><strong>Email:</strong> {userToDelete.email}</p>
                <p className="text-gray-300 text-sm lg:text-base"><strong>Vai trò:</strong> {getRoleDisplayName(userToDelete.role)}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
              >
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
              <button
                onClick={closeAllForms}
                disabled={loading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;