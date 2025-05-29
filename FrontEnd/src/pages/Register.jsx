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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const emailError = validateEmail(form.email);
    if (emailError) {
      return setError([emailError]);
    }

    // Validate password
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      return setError([passwordError]);
    }

    // Check password match
    if (form.password !== form.confirmPassword) {
      return setError(['Mật khẩu không khớp']);
    }

    try {
      await authApi.registerUser({
        username: form.username,
        email: form.email,
        password: form.password
      });
      navigate('/login');
    } catch (err) {
      let errorMessage = ['Đăng ký không thành công'];

      if (err.response?.data?.errors) {
        errorMessage = Object.values(err.response.data.errors).map(e => e.message);
      } else if (err.response?.data?.message) {
        errorMessage = [err.response.data.message];
      } else if (err.message) {
        errorMessage = [err.message];
      }

      setError(errorMessage);
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
            className='rounded-lg bg-gray-700 mt-2 p-2 text-white'
            type="text"
            required
          />
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className='rounded-lg bg-gray-700 mt-2 p-2 text-white'
            type="email"
            required
          />
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Mật khẩu</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            className='p-2 rounded-lg bg-gray-700 mt-2 text-white'
            type="password"
            required
          />
          <small className="text-gray-500 mt-1">Mật khẩu phải có từ 8-16 ký tự</small>
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Nhập lại mật khẩu</label>
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className='p-2 rounded-lg bg-gray-700 mt-2 text-white'
            type="password"
            required
          />
        </div>

        <button type="submit" className='w-full my-5 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors'>
          ĐĂNG KÝ
        </button>
        <p className="text-sm text-gray-400 text-center mt-4">
          Bạn đã có tài khoản? <a href="/login" className="text-teal-400 hover:underline">Đăng nhập</a>
        </p>
      </form>
    </div>
  );
}
