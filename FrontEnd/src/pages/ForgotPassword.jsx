// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../api/authApi';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mã + mật khẩu mới
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Bước 1: Gửi mã xác minh
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.sendResetCode(email);
      setMessage(response.message);
      setStep(2);
      
      // Đếm ngược 60s trước khi cho phép gửi lại
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi mã xác minh');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh mã và đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!code || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.resetPassword(email, code, newPassword);
      setMessage(response.message);
      setStep(3); // Chuyển sang bước thành công
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.sendResetCode(email);
      setMessage('Mã xác minh mới đã được gửi');
      
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi lại mã');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <div className="max-w-[400px] w-full mx-4 rounded-lg bg-gray-900 p-8">
        
        {/* Bước 1: Nhập email */}
        {step === 1 && (
          <>
            <h2 className="text-4xl text-white font-bold text-center mb-6">
              QUÊN MẬT KHẨU
            </h2>
            
            <p className="text-gray-400 text-center mb-6">
              Nhập email của bạn để nhận mã xác minh
            </p>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            {message && <p className="text-green-500 text-sm text-center mb-4">{message}</p>}

            <form onSubmit={handleSendCode}>
              <label className="flex flex-col text-gray-400 py-2">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg bg-gray-700 mt-2 p-2"
                  placeholder="example@email.com"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full my-5 py-2 bg-teal-500 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã xác minh'}
              </button>
            </form>
          </>
        )}

        {/* Bước 2: Nhập mã và mật khẩu mới */}
        {step === 2 && (
          <>
            <h2 className="text-3xl text-white font-bold text-center mb-4">
              XÁC MINH MÃ
            </h2>
            
            <p className="text-gray-400 text-center mb-6">
              Nhập mã 6 số đã được gửi đến {email}
            </p>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            {message && <p className="text-green-500 text-sm text-center mb-4">{message}</p>}

            <form onSubmit={handleResetPassword}>
              <label className="flex flex-col text-gray-400 py-2">
                Mã xác minh
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="rounded-lg bg-gray-700 mt-2 p-2 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </label>

              <label className="flex flex-col text-gray-400 py-2">
                Mật khẩu mới
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-lg bg-gray-700 mt-2 p-2"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </label>

              <label className="flex flex-col text-gray-400 py-2">
                Xác nhận mật khẩu
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-lg bg-gray-700 mt-2 p-2"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full my-5 py-2 bg-teal-500 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={countdown > 0 || loading}
                className="text-teal-400 hover:underline disabled:text-gray-500 disabled:no-underline"
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
              </button>
            </div>
          </>
        )}

        {/* Bước 3: Thành công */}
        {step === 3 && (
          <>
            <div className="text-center">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h2 className="text-2xl text-white font-bold mb-4">
                ĐẶT LẠI THÀNH CÔNG
              </h2>
              <p className="text-gray-400 mb-6">
                Mật khẩu của bạn đã được cập nhật
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-2 bg-teal-500 text-white font-semibold rounded-lg text-center"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </>
        )}

        {/* Link quay lại */}
        {step < 3 && (
          <p className="text-sm text-gray-400 text-center mt-4">
            <Link to="/login" className="text-teal-400 hover:underline">
              ← Quay lại đăng nhập
            </Link>
          </p>
        )}
        
      </div>
    </div>
  );
};

export default ForgotPassword;