
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chào mừng bạn đến với GastroHealth AI</h2>
        <p className="text-gray-600 mb-6">
          Để bắt đầu, vui lòng nhập Google Gemini API Key của bạn. Điều này giúp cá nhân hóa trải nghiệm và quản lý chi phí API của riêng bạn.
        </p>
        <div className="mb-6">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            Google Gemini API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black placeholder-gray-500"
            placeholder="***************************************"
          />
           <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">Lấy API Key của bạn ở đây</a>
        </div>
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-300"
        >
          Lưu và Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;