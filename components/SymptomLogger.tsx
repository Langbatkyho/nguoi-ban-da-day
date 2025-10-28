
import React, { useState } from 'react';
import { SymptomLog } from '../types';

interface SymptomLoggerProps {
  onAddSymptom: (symptom: SymptomLog) => void;
  symptoms: SymptomLog[];
}

const SymptomLogger: React.FC<SymptomLoggerProps> = ({ onAddSymptom, symptoms }) => {
  const [showForm, setShowForm] = useState(false);
  const [painLevel, setPainLevel] = useState(5);
  const [painLocation, setPainLocation] = useState('');
  const [eatenFoods, setEatenFoods] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!painLocation.trim() || !eatenFoods.trim()) return;

    const newSymptom: SymptomLog = {
      id: new Date().toISOString(),
      painLevel,
      painLocation,
      startTime: new Date().toLocaleTimeString(),
      endTime: '',
      eatenFoods,
      timestamp: new Date(),
    };
    onAddSymptom(newSymptom);

    // Reset form
    setPainLevel(5);
    setPainLocation('');
    setEatenFoods('');
    setShowForm(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Nhật ký Triệu chứng</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          {showForm ? 'Đóng' : '+ Ghi lại cơn đau'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in-down">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-md font-medium text-gray-700">Mức độ đau (1-10)</label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="range" min="1" max="10" value={painLevel}
                  onChange={(e) => setPainLevel(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="font-bold text-indigo-600 text-xl w-10 text-center">{painLevel}</span>
              </div>
            </div>
            <div>
              <label htmlFor="painLocation" className="block text-md font-medium text-gray-700">Vị trí đau</label>
              <input
                type="text" id="painLocation" value={painLocation}
                onChange={(e) => setPainLocation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black placeholder-gray-500"
                placeholder="Ví dụ: vùng thượng vị, ợ nóng ở ngực"
                required
              />
            </div>
            <div>
              <label htmlFor="eatenFoods" className="block text-md font-medium text-gray-700">Bạn đã ăn gì trong 2-4 giờ qua?</label>
              <textarea
                id="eatenFoods" value={eatenFoods}
                onChange={(e) => setEatenFoods(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-24 bg-gray-100 text-black placeholder-gray-500"
                placeholder="Liệt kê các món ăn, cách nhau bởi dấu phẩy"
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300">Hủy</button>
              <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700">Lưu</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Lịch sử ghi nhận</h2>
        {symptoms.length === 0 ? (
          <p className="text-gray-500">Chưa có ghi nhận nào. Hãy nhấn nút "Ghi lại cơn đau" khi bạn cảm thấy không khỏe.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {symptoms.slice().reverse().map(symptom => (
              <li key={symptom.id} className="py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">{new Date(symptom.timestamp).toLocaleString('vi-VN')}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${symptom.painLevel > 7 ? 'bg-red-100 text-red-800' : symptom.painLevel > 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      Đau: {symptom.painLevel}/10
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {symptom.painLocation}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p><strong>Đã ăn:</strong> {symptom.eatenFoods}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default SymptomLogger;