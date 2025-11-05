import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, SymptomLog, MealPlan as MealPlanType } from '../types';
import { generateMealPlan } from '../services/geminiService';
import { LoadingSpinner } from './icons';

interface MealPlanProps {
  apiKey: string;
  userProfile: UserProfile;
  symptoms: SymptomLog[];
}

const MealPlan: React.FC<MealPlanProps> = ({ apiKey, userProfile, symptoms }) => {
  const [mealPlan, setMealPlan] = useState<MealPlanType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateMealPlan(apiKey, userProfile, symptoms);
      setMealPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, userProfile, symptoms]);

  useEffect(() => {
    fetchMealPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Thực đơn cho bạn</h1>
        <button
          onClick={fetchMealPlan}
          disabled={isLoading}
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex items-center gap-2"
        >
          {isLoading ? 'Đang tạo...' : 'Tạo lại thực đơn'}
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <LoadingSpinner size="12" />
            <p className="mt-4 text-lg text-gray-600">AI đang xây dựng thực đơn phù hợp nhất cho bạn...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {mealPlan && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mealPlan.map((dailyPlan, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b-2 border-indigo-200 pb-2">{dailyPlan.day}</h2>
              <ul className="space-y-4">
                {dailyPlan.meals.map((meal, mealIndex) => (
                  <li key={mealIndex}>
                    <div className="flex items-start">
                        <div className="bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            {meal.time.split(' ')[1] === 'AM' ? 'S' : (meal.time.includes('12') || meal.time.includes('1') || meal.time.includes('2')) ? 'T' : 'T'}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-700">{meal.name}</p>
                            <p className="text-sm text-gray-500">{meal.time} - {meal.portion}</p>
                        </div>
                    </div>
                    {meal.note && (
                        <div className="mt-2 ml-11 pl-3 border-l-2 border-indigo-100">
                            <p className="text-sm text-gray-600 italic">
                                {meal.note}
                            </p>
                        </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlan;