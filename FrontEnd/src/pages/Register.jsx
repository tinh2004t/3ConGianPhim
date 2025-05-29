import React, { useState } from 'react';
import authApi from '../api/authApi';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Xóa lỗi khi user bắt đầu nhập lại
    if (error) {
      setError(null);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email không hợp lệ';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (password.length > 16) {
      return 'Mật khẩu không được vượt quá 16 ký tự';
    }
    return null;
  };

  const validateUsername = (username) => {
    if (username.length < 3) {
      return 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    if (username.length > 30) {
      return 'Tên đăng nhập không được vượt quá 30 ký tự';
    }
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(username)) {
      return 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, chấm và dấu gạch ngang';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate username
      const usernameError = validateUsername(form.username);
      if (usernameError) {
        setError([usernameError]);
        setIsLoading(false);
        return;
      }

      // Validate email
      const emailError = validateEmail(form.email);
      if (emailError) {
        setError([emailError]);
        setIsLoading(false);
        return;
      }

      // Validate password
      const passwordError = validatePassword(form.password);
      if (passwordError) {
        setError([passwordError]);
        setIsLoading(false);
        return;
      }

      // Check password match
      if (form.password !== form.confirmPassword) {
        setError(['Mật khẩu không khớp']);
        setIsLoading(false);
        return;
      }

      await authApi.registerUser({
        username: form.username,
        email: form.email,
        password: form.password
      });

      // Log thành công ở frontend (tuỳ chọn)
      console.log('Registration successful:', {
        timestamp: new Date().toISOString(),
        username: form.username,
        email: form.email
      });

      navigate('/login', { 
        state: { 
          message: 'Đăng ký thành công! Vui lòng đăng nhập.' 
        } 
      });

    } catch (err) {
      let errorMessage = ['Đăng ký không thành công'];

      // Xử lý lỗi từ server
      if (err.response?.status === 400) {
        if (err.response.data?.errors) {
          // Xử lý lỗi validation từ mongoose
          if (Array.isArray(err.response.data.errors)) {
            errorMessage = err.response.data.errors.map(error => error.message);
          } else {
            errorMessage = Object.values(err.response.data.errors).map(e => e.message || e);
          }
        } else if (err.response.data?.message) {
          errorMessage = [err.response.data.message];
        }
      } else if (err.response?.status === 500) {
        errorMessage = ['Lỗi server. Vui lòng thử lại sau.'];
      } else if (err.message) {
        errorMessage = [err.message];
      }

      setError(errorMessage);

      // Log lỗi ở frontend để debug
      console.error('Registration error:', {
        timestamp: new Date().toISOString(),
        status: err.response?.status,
        errors: errorMessage,
        formData: {
          username: form.username,
          email: form.email
        },
        serverResponse: err.response?.data
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen w-full bg-black'>
      <form onSubmit={handleSubmit} className='max-w-[400px] w-full mx-4 rounded-lg bg-gray-900 p-8 px-8'>
        <h2 className='text-4xl text-white font-bold text-center'>ĐĂNG KÝ</h2>

        {/* Hiển thị nhiều dòng lỗi nếu có */}
        {Array.isArray(error) &&
          error.map((errMsg, idx) => (
            <p key={idx} className="text-red-500 text-sm text-center mt-2">{errMsg}</p>
          ))}

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Tên đăng nhập</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className='rounded-lg bg-gray-700 mt-2 p-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500'
            type="text"
            required
            disabled={isLoading}
          />
          <small className="text-gray-500 mt-1">3-30 ký tự, chỉ chứa chữ cái, số, _, ., -</small>
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className='rounded-lg bg-gray-700 mt-2 p-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500'
            type="email"
            required
            disabled={isLoading}
          />
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Mật khẩu</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            className='p-2 rounded-lg bg-gray-700 mt-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500'
            type="password"
            required
            disabled={isLoading}
          />
          <small className="text-gray-500 mt-1">Mật khẩu phải có từ 8-16 ký tự</small>
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Nhập lại mật khẩu</label>
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className='p-2 rounded-lg bg-gray-700 mt-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500'
            type="password"
            required
            disabled={isLoading}
          />
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
          {isLoading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}
        </button>
        
        <p className="text-sm text-gray-400 text-center mt-4">
          Bạn đã có tài khoản? <a href="/login" className="text-teal-400 hover:underline">Đăng nhập</a>
        </p>
      </form>
    </div>
  );
}