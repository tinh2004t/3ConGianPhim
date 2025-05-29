import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import authApi from '../api/authApi';
import { UserContext } from '../contexts/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(UserContext);

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hiển thị thông báo thành công từ trang đăng ký
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Xóa state để không hiển thị lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  /* -------------- handlers -------------- */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Xóa lỗi khi user bắt đầu nhập lại
    if (error) {
      setError('');
    }
    if (success) {
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await authApi.loginUser(form);
      const userData = jwtDecode(res.token);

      login(userData, res.token);

      // Log thành công ở frontend
      console.log('Login successful:', {
        timestamp: new Date().toISOString(),
        username: form.username,
        role: userData.role
      });

      navigate('/', { replace: true });
      
    } catch (err) {
      let errorMsg = 'Đăng nhập thất bại';
      
      if (err.response?.status === 401) {
        errorMsg = err.response.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
      } else if (err.response?.status === 500) {
        errorMsg = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      
      // Log lỗi đăng nhập ở frontend
      console.error('Login error:', {
        timestamp: new Date().toISOString(),
        username: form.username,
        error: errorMsg,
        status: err.response?.status,
        serverResponse: err.response?.data
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------- UI -------------- */
  return (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <form
        onSubmit={handleSubmit}
        className="max-w-[400px] w-full mx-4 rounded-lg bg-gray-900 p-8"
      >
        <h2 className="text-4xl text-white font-bold text-center mb-6">ĐĂNG&nbsp;NHẬP</h2>

        {/* Hiển thị thông báo thành công */}
        {success && (
          <p className="text-green-500 text-sm text-center mb-4 bg-green-100 bg-opacity-10 p-2 rounded">
            {success}
          </p>
        )}

        {/* Hiển thị lỗi */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4 bg-red-100 bg-opacity-10 p-2 rounded">
            {error}
          </p>
        )}

        <label className="flex flex-col text-gray-400 py-2">
          Tên đăng nhập
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="rounded-lg bg-gray-700 mt-2 p-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
            disabled={isLoading}
          />
        </label>

        <label className="flex flex-col text-gray-400 py-2">
          Mật khẩu
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="rounded-lg bg-gray-700 mt-2 p-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
            disabled={isLoading}
          />
        </label>

        <div className="flex justify-between text-gray-400 py-2 text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" /> Nhớ&nbsp;mật khẩu
          </label>
          <Link 
            to="/forgot-password" 
            className="cursor-pointer hover:text-white hover:underline"
          >
            Quên&nbsp;mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          className={`w-full my-5 py-2 text-white font-semibold rounded-lg transition-colors ${
            isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-teal-500 hover:bg-teal-600'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
        </button>

        <p className="text-sm text-gray-400 text-center">
          Bạn chưa có tài khoản?&nbsp;
          <Link to="/register" className="text-teal-400 hover:underline">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;