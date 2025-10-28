
import React, { useState, useCallback, useRef } from 'react';
import { UserProfile, FoodCheckResult, FoodSafety } from '../types';
import { checkFoodSafety } from '../services/geminiService';
import { LoadingSpinner } from './icons';

interface FoodCheckerProps {
  apiKey: string;
  userProfile: UserProfile;
}

const FoodChecker: React.FC<FoodCheckerProps> = ({ apiKey, userProfile }) => {
  const [foodName, setFoodName] = useState('');
  const [foodImage, setFoodImage] = useState<{file: File, base64: string, mimeType: string} | null>(null);
  const [result, setResult] = useState<FoodCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFoodImage({ file, base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName && !foodImage) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageData = foodImage ? { mimeType: foodImage.mimeType, data: foodImage.base64 } : undefined;
      const res = await checkFoodSafety(apiKey, userProfile, foodName, imageData);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, userProfile, foodName, foodImage]);

  const getResultCardClasses = (safetyLevel: FoodSafety) => {
    switch (safetyLevel) {
      case FoodSafety.Safe:
        return 'bg-green-100 border-green-500 text-green-800';
      case FoodSafety.Limit:
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case FoodSafety.Avoid:
        return 'bg-red-100 border-red-500 text-red-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Kiểm tra Thực phẩm Nhanh</h1>
      <p className="text-gray-600 mb-6">Nhập tên hoặc tải ảnh thực phẩm để AI phân tích mức độ phù hợp với bạn.</p>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="foodName" className="block text-sm font-medium text-gray-700">Tên thực phẩm</label>
            <input
              type="text"
              id="foodName"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-black placeholder-gray-500"
              placeholder="Ví dụ: Sữa chua Hy Lạp"
            />
          </div>

          <div className="flex items-center justify-center text-sm text-gray-500">
            <span className="flex-grow border-t"></span>
            <span className="px-2">HOẶC</span>
            <span className="flex-grow border-t"></span>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Tải ảnh thực phẩm</label>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                 <div className="space-y-1 text-center">
                    {foodImage ? (
                        <img src={URL.createObjectURL(foodImage.file)} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                    ) : (
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>{foodImage ? 'Thay đổi ảnh' : 'Tải lên một file'}</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} ref={fileInputRef} accept="image/*"/>
                        </label>
                        <p className="pl-1">{foodImage ? foodImage.file.name : 'hoặc kéo và thả'}</p>
                    </div>
                     <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                 </div>
             </div>
          </div>


          <button
            type="submit"
            disabled={isLoading || (!foodName && !foodImage)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isLoading ? <LoadingSpinner size="5" /> : 'Kiểm tra'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {result && !isLoading && (
        <div className={`mt-6 rounded-xl shadow-lg p-6 border-l-4 ${getResultCardClasses(result.safetyLevel)}`}>
          <h3 className="text-2xl font-bold">{result.safetyLevel}</h3>
          <p className="mt-2 text-md">{result.reason}</p>
        </div>
      )}
    </div>
  );
};

export default FoodChecker;