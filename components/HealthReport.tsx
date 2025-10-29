
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, SymptomLog } from '../types';
import { analyzeTriggers } from '../services/geminiService';
import { LoadingSpinner } from './icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HealthReportProps {
  apiKey: string;
  userProfile: UserProfile;
  symptoms: SymptomLog[];
}

const HealthReport: React.FC<HealthReportProps> = ({ apiKey, userProfile, symptoms }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (symptoms.length === 0) {
      setAnalysis("Chưa có dữ liệu triệu chứng để phân tích.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeTriggers(apiKey, userProfile, symptoms);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, userProfile, symptoms]);

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symptoms]);
  
  const formattedSymptoms = symptoms.map(s => ({
      name: new Date(s.timestamp).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit'}),
      'Mức độ đau': s.painLevel,
  }));
  
  const avgPain = symptoms.length > 0 
    ? (symptoms.reduce((acc, s) => acc + s.painLevel, 0) / symptoms.length).toFixed(1) 
    : 'N/A';

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Báo cáo Sức khỏe</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-gray-600">Tổng số ghi nhận</h3>
          <p className="text-4xl font-bold text-indigo-600">{symptoms.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-gray-600">Đau trung bình</h3>
          <p className="text-4xl font-bold text-yellow-500">{avgPain}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-gray-600">Ngày ghi nhận đầu tiên</h3>
          <p className="text-2xl font-bold text-green-600">{symptoms.length > 0 ? new Date(symptoms[0].timestamp).toLocaleDateString('vi-VN') : 'N/A'}</p>
        </div>
      </div>
      
      {symptoms.length > 1 && (
         <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Biểu đồ mức độ đau</h2>
           <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedSymptoms} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} allowDecimals={false}/>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Mức độ đau" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">Phân tích của AI về "thủ phạm" gây đau</h2>
          <button onClick={fetchAnalysis} disabled={isLoading} className="text-sm text-indigo-600 hover:underline disabled:text-gray-400">Làm mới</button>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <LoadingSpinner />
          </div>
        )}
        {error && (
           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>
        )}
        {analysis && !isLoading && (
          <div className="prose prose-indigo max-w-none text-gray-600">
            {analysis.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              if (trimmedLine === '') return <br key={index} />;

              const boldMatch = trimmedLine.match(/^\*\*(.*)\*\*$/);
              if (boldMatch && boldMatch[1]) {
                return <h3 key={index} className="font-bold text-lg mt-4 mb-2 text-gray-800">{boldMatch[1]}</h3>;
              }
              
              const listItemMatch = trimmedLine.match(/^[\*\-]\s(.*)/);
              if (listItemMatch && listItemMatch[1]) {
                  return <p key={index} className="ml-4">&bull; {listItemMatch[1]}</p>;
              }
              
              const numberedSectionMatch = trimmedLine.match(/^\d\.\s+\*\*(.*)\*\*$/);
              if (numberedSectionMatch && numberedSectionMatch[1]) {
                  return <h3 key={index} className="font-bold text-lg mt-4 mb-2 text-gray-800">{numberedSectionMatch[1]}</h3>;
              }
              
              return <p key={index}>{line}</p>;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthReport;