
import React, { useState } from 'react';
import { UserProfile, Condition, DietaryGoal } from '../types';

interface OnboardingSurveyProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    condition: Condition.Reflux,
    painLevel: 5,
    triggerFoods: '',
    dietaryGoal: DietaryGoal.PainRelief,
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(profile);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Tình trạng bệnh lý chính của bạn là gì?</label>
            <select
              value={profile.condition}
              onChange={(e) => setProfile({ ...profile, condition: e.target.value as Condition })}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-black"
            >
              {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        );
      case 2:
        return (
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Mức độ đau hoặc khó chịu trung bình của bạn hiện tại? (1=Nhẹ, 10=Rất nặng)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={profile.painLevel}
                onChange={(e) => setProfile({ ...profile, painLevel: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-bold text-indigo-600 text-xl w-10 text-center">{profile.painLevel}</span>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Liệt kê các thực phẩm hoặc nhóm thực phẩm bạn đã biết gây kích ứng (cách nhau bởi dấu phẩy).</label>
            <textarea
              value={profile.triggerFoods}
              onChange={(e) => setProfile({ ...profile, triggerFoods: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg h-32 bg-gray-100 text-black placeholder-gray-500"
              placeholder="Ví dụ: đồ ăn cay, cà chua, cà phê..."
            />
          </div>
        );
      case 4:
        return (
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Mục tiêu chính của bạn khi sử dụng ứng dụng này là gì?</label>
            <select
              value={profile.dietaryGoal}
              onChange={(e) => setProfile({ ...profile, dietaryGoal: e.target.value as DietaryGoal })}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-black"
            >
              {Object.values(DietaryGoal).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 transform transition-all">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cá nhân hóa trải nghiệm</h2>
        <p className="text-gray-600 mb-6">Hãy trả lời một vài câu hỏi để chúng tôi có thể đưa ra gợi ý tốt nhất cho bạn.</p>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 min-h-[200px] flex flex-col justify-center">
          {renderStep()}
        </form>
        
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button onClick={handleBack} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
              Quay lại
            </button>
          ) : <div></div>}
          
          {step < 4 ? (
            <button onClick={handleNext} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
              Tiếp theo
            </button>
          ) : (
             <button onClick={handleSubmit} className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
              Hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingSurvey;