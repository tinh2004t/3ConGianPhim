// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import authApi from '../api/authApi';
import { UserContext } from '../contexts/UserContext';

const Login = () => {
  const navigate     = useNavigate();
  const { login }    = useContext(UserContext);

  const [form,  setForm]  = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  /* -------------- handlers -------------- */
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res       = await authApi.loginUser(form);   // gọi API
      const userData = jwtDecode(res.token);    // giải mã token

      login(userData, res.token);                // đưa vào Context + localStorage
      navigate('/', { replace: true });          // quay về trang chủ
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
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

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <label className="flex flex-col text-gray-400 py-2">
          Tên đăng nhập
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="rounded-lg bg-gray-700 mt-2 p-2"
            required
          />
        </label>

        <label className="flex flex-col text-gray-400 py-2">
          Mật khẩu
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="rounded-lg bg-gray-700 mt-2 p-2"
            required
          />
        </label>

        <div className="flex justify-between text-gray-400 py-2 text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" /> Nhớ&nbsp;mật khẩu
          </label>
          <span className="cursor-pointer hover:text-white">Quên&nbsp;mật khẩu?</span>
        </div>

        <button
          type="submit"
          className="w-full my-5 py-2 bg-teal-500 text-white font-semibold rounded-lg"
        >
          Đăng&nbsp;nhập
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
