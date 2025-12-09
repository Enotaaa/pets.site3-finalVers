import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import UserOrders from './UserOrders';

const ProfileModal = () => {
  const { user, updateUserData } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [registrationDate, setRegistrationDate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.token) return;
    
    try {
      const response = await fetch('https://pets.xn--80ahdri7a.site/api/users', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Получены данные пользователя:', data);
        
        setUserData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        
        // Получаем дату регистрации из данных сервера
        // Формат даты может быть разный, проверяем возможные варианты
        let date = null;
        
        if (data.registrationDate) {
          // Пробуем разные форматы
          const dateStr = data.registrationDate.trim();
          
          if (dateStr.includes('-')) {
            // Формат ISO: "2025-12-09" или "2025-12-09T00:00:00.000Z"
            date = new Date(dateStr);
          } else if (dateStr.includes('.')) {
            // Формат "DD.MM.YYYY"
            const [day, month, year] = dateStr.split('.').map(Number);
            date = new Date(year, month - 1, day);
          } else if (dateStr.includes('/')) {
            // Формат "MM/DD/YYYY" или "DD/MM/YYYY"
            const parts = dateStr.split('/').map(Number);
            if (parts[0] > 12) {
              // Первая часть больше 12, значит это день (DD/MM/YYYY)
              date = new Date(parts[2], parts[1] - 1, parts[0]);
            } else {
              // Первая часть <= 12, может быть американский формат (MM/DD/YYYY)
              date = new Date(parts[2], parts[0] - 1, parts[1]);
            }
          }
          
          // Проверяем, что дата валидна
          if (date && !isNaN(date.getTime())) {
            setRegistrationDate(date);
            console.log('Дата регистрации установлена:', date);
          } else {
            console.warn('Не удалось распарсить дату регистрации:', data.registrationDate);
            setRegistrationDate(new Date()); // Fallback на текущую дату
          }
        } else {
          console.warn('Дата регистрации не найдена в ответе сервера');
          // Если даты нет на сервере, используем дату из localStorage или текущую дату
          const storedDate = localStorage.getItem(`user_registration_${user.id}`);
          if (storedDate) {
            setRegistrationDate(new Date(storedDate));
          } else {
            setRegistrationDate(new Date());
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // В случае ошибки используем текущую дату
      setRegistrationDate(new Date());
    }
  };

  // Функция для расчета количества дней с момента регистрации
  const calculateDaysSinceRegistration = () => {
    if (!registrationDate) return 0;
    
    const now = new Date();
    const diffMs = now - registrationDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Если разница отрицательная (будущая дата), возвращаем 0
    return Math.max(0, diffDays);
  };

  // Функция для форматирования даты регистрации
  const formatRegistrationDate = () => {
    if (!registrationDate) return 'Недавно';
    
    return registrationDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Функция для получения правильного склонения слова "день"
  const getDaysText = (days) => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'дней';
    }
    
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
  };

  // Функция для отладки - выводит информацию о дате
  const debugDateInfo = () => {
    if (!registrationDate) return null;
    
    return (
      <div className="mt-2 p-2 border border-info rounded small">
        <strong>Отладка даты:</strong><br />
        Исходная строка с сервера: {user?.registrationDate || 'не указана'}<br />
        Распарсено как: {registrationDate.toString()}<br />
        ISO формат: {registrationDate.toISOString()}<br />
        Локальный формат: {registrationDate.toLocaleDateString()}<br />
        Timestamp: {registrationDate.getTime()}<br />
        Разница с сегодня: {calculateDaysSinceRegistration()} {getDaysText(calculateDaysSinceRegistration())}
      </div>
    );
  };

  const validateForm = () => {
    const errors = {};
    
    if (!userData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'Некорректный email';
    }
    
    if (!userData.phone.trim()) {
      errors.phone = 'Телефон обязателен';
    }
    
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setMessage({ type: 'danger', text: 'Исправьте ошибки в форме' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Обновление email
      if (userData.email !== user.email) {
        const emailResponse = await fetch('https://pets.xn--80ahdri7a.site/api/users/email', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ email: userData.email })
        });
        
        if (!emailResponse.ok) {
          throw new Error('Ошибка при обновлении email');
        }
      }
      
      // Обновление телефона
      if (userData.phone !== user.phone) {
        const phoneResponse = await fetch('https://pets.xn--80ahdri7a.site/api/users/phone', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ phone: userData.phone })
        });
        
        if (!phoneResponse.ok) {
          throw new Error('Ошибка при обновлении телефона');
        }
      }
      
      // Обновляем данные в контексте
      updateUserData({
        email: userData.email,
        phone: userData.phone,
        name: userData.name
      });
      
      setMessage({ type: 'success', text: 'Данные успешно обновлены!' });
      setIsEditing(false);
      
      // Обновляем данные профиля
      fetchUserProfile();
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'Ошибка при обновлении данных' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUserData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal fade" id="profileModal" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {user ? `Личный кабинет - ${user.name}` : 'Личный кабинет'}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          
          <div className="modal-body">
            {!user ? (
              <div className="text-center p-4">
                <p>Для доступа к личному кабинету необходимо войти в систему.</p>
                <button 
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#authModal"
                  data-bs-dismiss="modal"
                >
                  Войти / Зарегистрироваться
                </button>
              </div>
            ) : (
              <>
                {message.text && (
                  <div className={`alert alert-${message.type}`}>
                    {message.text}
                  </div>
                )}
                
                <div className="row">
                  <div className="col-md-6">
                    <h5>Данные пользователя</h5>
                    <div className="mb-3">
                      <label className="form-label">Имя</label>
                      <input
                        type="text"
                        className="form-control"
                        value={userData.name}
                        disabled
                        readOnly
                      />
                      <small className="text-muted">Изменить имя можно только при регистрации</small>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={`form-control ${message.type === 'danger' && !userData.email ? 'is-invalid' : ''}`}
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing || isLoading}
                      />
                      {isEditing && (
                        <small className="text-muted">Обязательное поле, должен быть валидным email</small>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Телефон *</label>
                      <input
                        type="tel"
                        className={`form-control ${message.type === 'danger' && !userData.phone ? 'is-invalid' : ''}`}
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing || isLoading}
                        placeholder="+79112345678"
                      />
                      {isEditing && (
                        <small className="text-muted">Обязательное поле</small>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 border rounded bg-light">
                      <h6>Статистика аккаунта</h6>
                      <div className="mt-2">
                        <strong>ID пользователя:</strong> {user.id || 'Не указан'}<br />
                        <strong>Статус:</strong> Активен<br />
                        <strong>Дата регистрации:</strong> {formatRegistrationDate()}<br />
                        <strong>На сайте:</strong> {calculateDaysSinceRegistration()} {getDaysText(calculateDaysSinceRegistration())}
                      </div>
                      
                      {/* Раскомментируйте для отладки */}
                      {/* {debugDateInfo()} */}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <UserOrders />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              data-bs-dismiss="modal"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Закрыть
            </button>
            
            {user && (
              <>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                  disabled={isLoading}
                >
                  {isEditing ? 'Отменить' : 'Редактировать'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!isEditing || isLoading}
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;