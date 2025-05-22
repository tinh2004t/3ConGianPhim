import React, { useEffect, useState } from 'react';
import genreApi from '../../../api/genreApi';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import { Plus, Edit3, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
  const fetchGenres = async () => {
    try {
      const response = await genreApi.getAll();
      console.log('Genres:', response);
      setGenres(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch genres:', error);
    }
  };
  fetchGenres();
}, []);


  const itemsPerPage = 10;
  const filteredGenres = genres.filter(
    genre =>
      genre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      genre.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredGenres.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGenres = filteredGenres.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = async () => {
  try {
    if (showEditForm) {
      await genreApi.update(editingGenre._id, formData, token);
    } else {
      await genreApi.create(formData, token);
    }

    // Lấy lại danh sách genres sau khi cập nhật
    const updated = await genreApi.getAll();
    setGenres(updated.data?.data || []); // ✅ Đảm bảo là mảng

    closeForm();
  } catch (error) {
    console.error('Error saving genre:', error);
  }
};


  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setFormData({ name: genre.name, description: genre.description });
    setShowEditForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      try {
        await genreApi.delete(id, token);
        const updated = await genreApi.getAll();
        setGenres(updated.data?.data || []); // ✅ Đảm bảo là mảng
      } catch (error) {
        console.error('Failed to delete genre:', error);
      }
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingGenre(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Quản lý thể loại</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm thể loại mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm thể loại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Genres Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tên thể loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentGenres.map((genre) => (
                <tr key={genre._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-white font-medium">{genre.name}</td>
                  <td className="px-6 py-4 text-gray-300 max-w-md truncate">{genre.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(genre)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(genre._id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
          Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredGenres.length)} của {filteredGenres.length} thể loại
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-2 bg-gray-700 text-white rounded">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {showEditForm ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tên thể loại</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
                >
                  {showEditForm ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  onClick={closeForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white"
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

export default Genres;
