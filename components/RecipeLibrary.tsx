
import React, { useState, useMemo } from 'react';
import { Recipe, UserProfile } from '../types';
import { suggestRecipe } from '../services/geminiService';
import { LoadingSpinner } from './icons';


const initialRecipes: Recipe[] = [
  {
    title: 'Súp Gà Hầm Gừng Cà Rốt',
    description: 'Một món súp nhẹ nhàng, dễ tiêu hóa, giúp làm ấm bụng và cung cấp dinh dưỡng.',
    category: 'Giảm đau',
    cookTime: '45 phút',
    ingredients: ['Ức gà', 'Cà rốt', 'Gừng', 'Hành lá', 'Muối, tiêu'],
    instructions: '1. Rửa sạch ức gà, luộc sơ và xé nhỏ. 2. Cà rốt, gừng gọt vỏ, thái nhỏ. 3. Cho gà, cà rốt, gừng vào nồi hầm với nước dùng trong 30 phút. 4. Nêm gia vị vừa ăn, thêm hành lá và dùng nóng.'
  },
  {
    title: 'Cháo Yến Mạch Chuối',
    description: 'Bữa sáng giàu chất xơ hòa tan, giúp bao bọc niêm mạc dạ dày và giảm acid.',
    category: 'Chống ợ nóng',
    cookTime: '10 phút',
    ingredients: ['Yến mạch cán dẹt', 'Chuối chín', 'Sữa hạnh nhân (hoặc nước)', 'Hạt chia'],
    instructions: '1. Cho yến mạch và sữa/nước vào nồi, đun sôi nhỏ lửa 5 phút. 2. Trong khi đó, nghiền nát chuối. 3. Cho chuối và hạt chia vào cháo, khuấy đều và nấu thêm 2 phút. Dùng ấm.'
  },
  {
    title: 'Cá Hồi Áp Chảo Măng Tây',
    description: 'Cung cấp Omega-3 tốt cho việc phục hồi và măng tây chứa nhiều vitamin.',
    category: 'Phục hồi',
    cookTime: '20 phút',
    ingredients: ['Phi lê cá hồi', 'Măng tây', 'Dầu ô liu', 'Chanh', 'Muối, thì là'],
    instructions: '1. Rửa sạch cá và măng tây. 2. Ướp cá với muối, thì là và một ít nước cốt chanh. 3. Áp chảo cá hồi với dầu ô liu cho đến khi chín vàng hai mặt. 4. Xào nhanh măng tây trên cùng chảo. Dùng kèm cơm gạo lứt.'
  },
   {
    title: 'Khoai Lang Nướng Mật Ong',
    description: 'Món ăn nhẹ nhàng, cung cấp carb phức hợp và tốt cho hệ tiêu hóa.',
    category: 'Giảm đau',
    cookTime: '40 phút',
    ingredients: ['Khoai lang', 'Mật ong', 'Dầu ô liu', 'Bột quế'],
    instructions: '1. Rửa sạch khoai, cắt thành từng miếng vừa ăn. 2. Trộn đều khoai với dầu ô liu, mật ong và bột quế. 3. Nướng ở 200°C trong 25-30 phút cho đến khi khoai mềm và có màu vàng đẹp.'
  },
  {
    title: 'Sinh Tố Đu Đủ Gừng',
    description: 'Đu đủ chứa enzyme papain hỗ trợ tiêu hóa, gừng giúp giảm buồn nôn.',
    category: 'Chống ợ nóng',
    cookTime: '5 phút',
    ingredients: ['Đu đủ chín', 'Một lát gừng nhỏ', 'Sữa chua không đường', 'Nước lọc'],
    instructions: '1. Gọt vỏ, bỏ hạt đu đủ và cắt nhỏ. 2. Cho tất cả nguyên liệu vào máy xay sinh tố. 3. Xay nhuyễn mịn và dùng ngay.'
  }
];

interface RecipeLibraryProps {
    apiKey: string;
    userProfile: UserProfile;
}

const SuggestionModal: React.FC<{
    onClose: () => void;
    apiKey: string;
    userProfile: UserProfile;
}> = ({ onClose, apiKey, userProfile }) => {
    const [request, setRequest] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedRecipe, setSuggestedRecipe] = useState<Recipe | null>(null);

    const handleSubmit = async () => {
        if (!request.trim()) return;
        setIsLoading(true);
        setError(null);
        setSuggestedRecipe(null);
        try {
            const recipe = await suggestRecipe(apiKey, userProfile, request);
            setSuggestedRecipe(recipe);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full mx-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
                {!suggestedRecipe ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Đề xuất công thức</h2>
                        <p className="text-gray-600 mb-6">Hãy cho AI biết bạn đang muốn nấu món gì hoặc có những nguyên liệu nào. AI sẽ tạo một công thức phù hợp với bạn.</p>
                        <textarea
                            value={request}
                            onChange={(e) => setRequest(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg h-24 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                            placeholder="Ví dụ: một món súp gà đơn giản, hoặc: tôi có ức gà và bông cải xanh..."
                            disabled={isLoading}
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={onClose} disabled={isLoading} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 disabled:opacity-50">Hủy</button>
                            <button onClick={handleSubmit} disabled={isLoading || !request.trim()} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center min-w-[120px]">
                                {isLoading ? <LoadingSpinner size="5" /> : 'Tạo công thức'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                         <h2 className="text-2xl font-bold mb-4">{suggestedRecipe.title}</h2>
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 bg-purple-100 text-purple-800">{suggestedRecipe.category}</span>
                        <p className="italic text-gray-600 mb-4">{suggestedRecipe.description}</p>
                        <p className="mb-4"><strong>Thời gian nấu:</strong> {suggestedRecipe.cookTime}</p>
                        <div className="max-h-60 overflow-y-auto pr-2">
                            <h3 className="font-bold mb-2">Nguyên liệu:</h3>
                            <ul className="list-disc list-inside mb-4 pl-2 space-y-1">
                                {suggestedRecipe.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                            </ul>
                            <h3 className="font-bold mb-2">Hướng dẫn:</h3>
                            <p className="whitespace-pre-line">{suggestedRecipe.instructions}</p>
                        </div>
                        <button onClick={onClose} className="mt-6 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 w-full">Tuyệt vời! Đóng</button>
                    </div>
                )}
            </div>
        </div>
    );
};


const RecipeLibrary: React.FC<RecipeLibraryProps> = ({apiKey, userProfile}) => {
    const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
    const [filter, setFilter] = useState<'All' | Recipe['category']>('All');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);

    const filteredRecipes = useMemo(() => {
        if (filter === 'All') return recipes;
        return recipes.filter(r => r.category === filter);
    }, [filter, recipes]);
    
    const getCategoryClasses = (category: Recipe['category']) => {
        switch (category) {
            case 'Giảm đau': return 'bg-blue-100 text-blue-800';
            case 'Chống ợ nóng': return 'bg-yellow-100 text-yellow-800';
            case 'Phục hồi': return 'bg-green-100 text-green-800';
            case 'AI Tùy chỉnh': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }


    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Thư viện Công thức</h1>
                    <p className="text-gray-600">Khám phá các công thức nấu ăn dễ tiêu hóa và an toàn.</p>
                </div>
                <button 
                    onClick={() => setShowSuggestionModal(true)}
                    className="flex-shrink-0 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
                >
                    + Đề xuất công thức bằng AI
                </button>
            </div>


            <div className="mb-6 flex flex-wrap gap-2">
                <button onClick={() => setFilter('All')} className={`px-4 py-2 rounded-full font-semibold text-sm ${filter === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Tất cả</button>
                <button onClick={() => setFilter('Giảm đau')} className={`px-4 py-2 rounded-full font-semibold text-sm ${filter === 'Giảm đau' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Giảm đau</button>
                <button onClick={() => setFilter('Chống ợ nóng')} className={`px-4 py-2 rounded-full font-semibold text-sm ${filter === 'Chống ợ nóng' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Chống ợ nóng</button>
                <button onClick={() => setFilter('Phục hồi')} className={`px-4 py-2 rounded-full font-semibold text-sm ${filter === 'Phục hồi' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Phục hồi</button>
                 <button onClick={() => setFilter('AI Tùy chỉnh')} className={`px-4 py-2 rounded-full font-semibold text-sm ${filter === 'AI Tùy chỉnh' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>AI Tùy chỉnh</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                    <div key={recipe.title} onClick={() => setSelectedRecipe(recipe)} className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">{recipe.title}</h2>
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getCategoryClasses(recipe.category)}`}>{recipe.category}</span>
                            <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
                        </div>
                        <div className="text-sm font-medium text-indigo-600 mt-auto">Xem chi tiết &rarr;</div>
                    </div>
                ))}
                 {filteredRecipes.length === 0 && (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-12">
                        <p className="text-gray-500">Không tìm thấy công thức nào phù hợp.</p>
                    </div>
                )}
            </div>
            
            {showSuggestionModal && <SuggestionModal onClose={() => setShowSuggestionModal(false)} apiKey={apiKey} userProfile={userProfile} />}

            {selectedRecipe && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedRecipe(null)}>
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">{selectedRecipe.title}</h2>
                        <p className="mb-4"><strong>Thời gian nấu:</strong> {selectedRecipe.cookTime}</p>
                        <h3 className="font-bold mb-2">Nguyên liệu:</h3>
                        <ul className="list-disc list-inside mb-4 pl-2 space-y-1">
                            {selectedRecipe.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                        </ul>
                        <h3 className="font-bold mb-2">Hướng dẫn:</h3>
                        <p className="whitespace-pre-line text-gray-700">{selectedRecipe.instructions}</p>
                        <button onClick={() => setSelectedRecipe(null)} className="mt-6 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 w-full">Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeLibrary;
