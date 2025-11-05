import React, { useState, useEffect } from 'react';

const Reminders: React.FC = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [mealReminders, setMealReminders] = useState(() => {
    const saved = localStorage.getItem('mealReminders');
    return saved ? JSON.parse(saved) : {
      breakfast: { time: '07:00', enabled: true },
      lunch: { time: '12:30', enabled: true },
      dinner: { time: '18:30', enabled: true },
    };
  });
  const [waterReminder, setWaterReminder] = useState(() => {
    const saved = localStorage.getItem('waterReminder');
    return saved ? JSON.parse(saved) : { interval: 60, enabled: false }; // interval in minutes
  });

  const requestNotificationPermission = async () => {
    const permissionResult = await Notification.requestPermission();
    setPermission(permissionResult);
  };

  useEffect(() => {
    localStorage.setItem('mealReminders', JSON.stringify(mealReminders));
    localStorage.setItem('waterReminder', JSON.stringify(waterReminder));
    // In a real app, you would schedule/reschedule notifications here using a service worker for persistence.
    // For this demo, notifications are not persistent after a page refresh.
  }, [mealReminders, waterReminder]);

  const handleMealChange = (meal: string, field: 'time' | 'enabled', value: string | boolean) => {
    setMealReminders((prev: any) => ({
      ...prev,
      [meal]: { ...prev[meal], [field]: value }
    }));
  };

  const handleWaterChange = (field: 'interval' | 'enabled', value: number | boolean) => {
    setWaterReminder(prev => ({ ...prev, [field]: value }));
  };

  const showTestNotification = () => {
    if (permission !== 'granted') {
        alert("Vui lòng cấp quyền thông báo trước.");
        return;
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: 'GastroHealth AI',
            options: {
                body: 'Đây là thông báo thử nghiệm!',
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png'
            }
        });
    } else {
        alert("Không thể gửi thông báo. Service worker chưa sẵn sàng.");
        console.error("Service worker controller not available.");
    }
  }

  if (permission === 'denied') {
    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <h1 className="text-2xl font-bold text-red-600 mt-4 mb-4">Quyền nhận thông báo đã bị chặn</h1>
                <p className="text-gray-600 mb-6">
                Để sử dụng tính năng nhắc nhở, bạn cần cho phép trang web này gửi thông báo. Hãy làm theo các bước sau:
                </p>
                <div className="text-left bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">Cách cho phép lại:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>
                        Nhìn lên thanh địa chỉ của trình duyệt, bạn sẽ thấy một biểu tượng <strong>ổ khóa (🔒)</strong> ở bên trái.
                        </li>
                        <li>
                        Nhấn vào biểu tượng <strong>ổ khóa (🔒)</strong> đó.
                        </li>
                        <li>
                        Tìm mục <strong>"Thông báo" (Notifications)</strong> và chuyển trạng thái từ "Chặn" (Block) sang <strong>"Cho phép" (Allow)</strong>.
                        </li>
                        <li>
                        Tải lại trang để áp dụng thay đổi.
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Nhắc nhở Ăn uống & Uống nước</h1>
      <p className="text-gray-600 mb-6">Thiết lập thông báo để duy trì thói quen lành mạnh.</p>

      {permission !== 'granted' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
              <p className="font-bold">Cần cấp quyền</p>
              <p>Để nhận được nhắc nhở, bạn cần cấp quyền cho ứng dụng gửi thông báo.</p>
              <button onClick={requestNotificationPermission} className="mt-2 bg-yellow-500 text-white font-bold py-1 px-3 rounded text-sm hover:bg-yellow-600">Cấp quyền</button>
          </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Nhắc nhở bữa ăn</h2>
        <div className="space-y-4">
          {Object.entries(mealReminders).map(([meal, settings]) => (
            <div key={meal} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="capitalize font-medium text-gray-800">{meal === 'breakfast' ? 'Bữa sáng' : meal === 'lunch' ? 'Bữa trưa' : 'Bữa tối'}</span>
              <div className="flex items-center gap-4">
                <input type="time" value={(settings as any).time} onChange={e => handleMealChange(meal, 'time', e.target.value)} className="border-gray-300 rounded-md shadow-sm bg-gray-100 text-black"/>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={(settings as any).enabled} onChange={e => handleMealChange(meal, 'enabled', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

       <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Nhắc nhở uống nước</h2>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-800">Nhắc nhở mỗi</span>
              <select value={waterReminder.interval} onChange={e => handleWaterChange('interval', parseInt(e.target.value))} className="mx-2 border-gray-300 rounded-md shadow-sm bg-gray-100 text-black">
                  <option value={30}>30 phút</option>
                  <option value={60}>1 giờ</option>
                  <option value={90}>1.5 giờ</option>
                  <option value={120}>2 giờ</option>
              </select>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={waterReminder.enabled} onChange={e => handleWaterChange('enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>
      </div>

       <div className="mt-6 text-center">
            <button onClick={showTestNotification} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Gửi thông báo thử
            </button>
            <p className="text-xs text-gray-500 mt-2">Lưu ý: Nhắc nhở chỉ hoạt động khi tab này đang mở.</p>
      </div>

    </div>
  );
};

export default Reminders;