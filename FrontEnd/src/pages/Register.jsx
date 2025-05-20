import React, { useState } from 'react';
import { registerUser } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Mật khẩu không khớp');
    }

    try {
      await registerUser({
        username: form.username,
        email: form.email,
        password: form.password
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className='flex items-center justify-center h-screen w-full bg-black'>
      <form onSubmit={handleSubmit} className='max-w-[400px] w-full mx-4 rounded-lg bg-gray-900 p-8 px-8'>
        <h2 className='text-4xl text-white font-bold text-center'>REGISTER</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange}
            className='rounded-lg bg-gray-700 mt-2 p-2' type="text" required />
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange}
            className='rounded-lg bg-gray-700 mt-2 p-2' type="email" required />
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Password</label>
          <input name="password" value={form.password} onChange={handleChange}
            className='p-2 rounded-lg bg-gray-700 mt-2' type="password" required />
        </div>

        <div className='flex flex-col text-gray-400 py-2'>
          <label>Confirm Password</label>
          <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
            className='p-2 rounded-lg bg-gray-700 mt-2' type="password" required />
        </div>

        <button type="submit" className='w-full my-5 py-2 bg-teal-500 text-white font-semibold rounded-lg'>
          REGISTER
        </button>
        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account? <a href="/login" className="text-teal-400 hover:underline">Login</a>
        </p>
      </form>
    </div>
  );
}
