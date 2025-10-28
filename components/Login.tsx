
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      onLogin(email.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Đăng nhập / Đăng ký</h2>
        <p className="text-gray-600 mb-6">
          Chào mừng bạn đến với GastroHealth AI. Vui lòng nhập email của bạn để bắt đầu.
        </p>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black placeholder-gray-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!email.trim() || !email.includes('@')}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-300"
          >
            Bắt đầu
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;