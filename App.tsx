import React, { useState, useEffect } from 'react';
import { UserProfile, SymptomLog } from './types';
import Login from './components/Login';
import ApiKeyModal from './components/ApiKeyModal';
import OnboardingSurvey from './components/OnboardingSurvey';
import MealPlan from './components/MealPlan';
import FoodChecker from './components/FoodChecker';
import SymptomLogger from './components/SymptomLogger';
import HealthReport from './components/HealthReport';
import RecipeLibrary from './components/RecipeLibrary';
import Reminders from './components/Reminders';
import { MenuIcon, CloseIcon, HomeIcon, FoodCheckIcon, SymptomIcon, ReportIcon, RecipeIcon, ReminderIcon, LogoutIcon } from './components/icons';

type View = 'mealPlan' | 'foodChecker' | 'symptomLogger' | 'healthReport' | 'recipeLibrary' | 'reminders';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('userEmail'));
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('geminiApiKey'));
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [symptoms, setSymptoms] = useState<SymptomLog[]>(() => {
      const savedSymptoms = localStorage.getItem('symptomLogs');
      return savedSymptoms ? JSON.parse(savedSymptoms) : [];
  });
  const [activeView, setActiveView] = useState<View>('symptomLogger');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [showConfirmLogoutModal, setShowConfirmLogoutModal] = useState(false);
  const [showLogoutSuccessMessage, setShowLogoutSuccessMessage] = useState(false);


  useEffect(() => {
    if (userEmail) localStorage.setItem('userEmail', userEmail);
    else localStorage.removeItem('userEmail');
  }, [userEmail]);

  useEffect(() => {
    if (apiKey) localStorage.setItem('geminiApiKey', apiKey);
     else localStorage.removeItem('geminiApiKey');
  }, [apiKey]);

  useEffect(() => {
    if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile));
     else localStorage.removeItem('userProfile');
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('symptomLogs', JSON.stringify(symptoms));
  }, [symptoms]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
  };

  const handleSurveyComplete = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  const addSymptom = (symptom: SymptomLog) => {
    setSymptoms(prev => [...prev, symptom]);
  }

  const handleLogoutClick = () => {
    setShowConfirmLogoutModal(true);
  };

  const confirmLogoutAndDelete = () => {
    localStorage.clear();
    setShowConfirmLogoutModal(false);
    setShowLogoutSuccessMessage(true);
    
    setTimeout(() => {
      // Reset all state to return to login screen
      setShowLogoutSuccessMessage(false);
      setUserEmail(null);
      setApiKey(null);
      setUserProfile(null);
      setSymptoms([]);
      setActiveView('symptomLogger');
    }, 2000);
  };

  const cancelLogout = () => {
    setShowConfirmLogoutModal(false);
  };


  const renderView = () => {
    if (!userProfile || !apiKey) return null;

    switch (activeView) {
      case 'mealPlan':
        return <MealPlan apiKey={apiKey} userProfile={userProfile} symptoms={symptoms} />;
      case 'foodChecker':
        return <FoodChecker apiKey={apiKey} userProfile={userProfile} />;
      case 'symptomLogger':
        return <SymptomLogger onAddSymptom={addSymptom} symptoms={symptoms} />;
      case 'healthReport':
        return <HealthReport apiKey={apiKey} userProfile={userProfile} symptoms={symptoms} />;
      case 'recipeLibrary':
        return <RecipeLibrary apiKey={apiKey} userProfile={userProfile} />;
      case 'reminders':
        return <Reminders />;
      default:
        return <SymptomLogger onAddSymptom={addSymptom} symptoms={symptoms} />;
    }
  };

  const NavItem = ({ view, label, icon, currentView, setView }: { view: View, label: string, icon: React.ReactElement, currentView: View, setView: (v: View) => void }) => (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setView(view);
          setSidebarOpen(false);
        }}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
          currentView === view
            ? 'bg-indigo-100 text-indigo-700 font-bold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {icon}
        <span className="text-md">{label}</span>
      </a>
    </li>
  );
  
  if (showLogoutSuccessMessage) {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 text-white animate-fade-in">
            <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-3xl font-bold mt-4">Đã xóa dữ liệu thành công!</h2>
                <p className="mt-2 text-lg text-gray-300">Đang quay về màn hình đăng nhập...</p>
            </div>
        </div>
    );
  }

  if (!userEmail) {
    return <Login onLogin={handleLogin} />;
  }

  if (!apiKey) {
    return <ApiKeyModal onSave={handleSaveApiKey} />;
  }

  if (!userProfile) {
    return <OnboardingSurvey onComplete={handleSurveyComplete} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-2xl font-bold text-indigo-600">GastroHealth AI</h1>
           <button onClick={() => setSidebarOpen(false)} className="text-gray-500 focus:outline-none md:hidden">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <NavItem view="symptomLogger" label="Theo dõi Triệu chứng" icon={<SymptomIcon />} currentView={activeView} setView={setActiveView} />
                <NavItem view="mealPlan" label="Thực đơn Cá nhân hóa" icon={<HomeIcon />} currentView={activeView} setView={setActiveView} />
                <NavItem view="foodChecker" label="Kiểm tra Thực phẩm" icon={<FoodCheckIcon />} currentView={activeView} setView={setActiveView} />
                <NavItem view="healthReport" label="Báo cáo Sức khỏe" icon={<ReportIcon />} currentView={activeView} setView={setActiveView} />
                 <div className="pt-2 mt-2 border-t">
                    <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Công cụ</p>
                    <NavItem view="recipeLibrary" label="Thư viện Công thức" icon={<RecipeIcon />} currentView={activeView} setView={setActiveView} />
                    <NavItem view="reminders" label="Nhắc nhở" icon={<ReminderIcon />} currentView={activeView} setView={setActiveView} />
                </div>
              </ul>
            </nav>
            <div className="p-4 mt-auto border-t">
                <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full p-3 rounded-lg text-left text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                >
                    <LogoutIcon />
                    <span className="text-md">Đăng xuất & Xóa dữ liệu</span>
                </button>
            </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between md:justify-end items-center p-4 bg-white border-b md:border-none">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 focus:outline-none md:hidden">
            <MenuIcon />
          </button>
          <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{userProfile.condition}</p>
              <p className="text-xs text-gray-500">Mục tiêu: {userProfile.dietaryGoal}</p>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {renderView()}
        </main>
      </div>
      
      {showConfirmLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Xác nhận</h2>
                <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất và xóa tất cả dữ liệu đã lưu không? Hành động này không thể hoàn tác.</p>
                <div className="flex justify-end gap-4">
                    <button onClick={cancelLogout} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300">
                        Hủy
                    </button>
                    <button onClick={confirmLogoutAndDelete} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700">
                        Xác nhận Xóa
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;