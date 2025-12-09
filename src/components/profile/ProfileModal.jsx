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
      // Получаем или создаем дату регистрации из localStorage
      const storedDate = localStorage.getItem(`user_registration_${user.id}`);
      if (storedDate) {
        setRegistrationDate(new Date(storedDate));
      } else {
        // Если даты нет в localStorage, создаем новую и сохраняем
        const newRegistrationDate = new Date();
        localStorage.setItem(`user_registration_${user.id}`, newRegistrationDate.toISOString());
        setRegistrationDate(newRegistrationDate);
      }
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
        setUserData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Функция для расчета времени с момента регистрации
  const calculateTimeSinceRegistration = () => {
    if (!registrationDate) return 'Недавно';
    
    const now = new Date();
    const diffMs = now - registrationDate;
    
    // Рассчитываем разницу в разных единицах времени
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    // Определяем наиболее подходящую единицу времени для отображения
    if (diffYears > 0) {
      return `${diffYears} год${getRussianPlural(diffYears, ['год', 'года', 'лет'])}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} месяц${getRussianPlural(diffMonths, ['месяц', 'месяца', 'месяцев'])}`;
    } else if (diffWeeks > 0) {
      return `${diffWeeks} недел${getRussianPlural(diffWeeks, ['я', 'и', 'ь'])}`;
    } else if (diffDays > 0) {
      return `${diffDays} ден${getRussianPlural(diffDays, ['ь', 'я', 'ей'])}`;
    } else if (diffHours > 0) {
      return `${diffHours} час${getRussianPlural(diffHours, ['', 'а', 'ов'])}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} минут${getRussianPlural(diffMinutes, ['а', 'ы', ''])}`;
    } else {
      return `${diffSeconds} секунд${getRussianPlural(diffSeconds, ['а', 'ы', ''])}`;
    }
  };

  // Функция для получения правильного склонения русского слова
  const getRussianPlural = (number, words) => {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
  };

  // Функция для форматирования даты регистрации
  const formatRegistrationDate = () => {
    if (!registrationDate) return 'Недавно';
    
    return registrationDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция для расчета процента года
  const calculateYearPercentage = () => {
    if (!registrationDate) return 0;
    
    const now = new Date();
    const diffMs = now - registrationDate;
    const oneYearMs = 1000 * 60 * 60 * 24 * 365;
    
    // Ограничиваем максимальный процент 100%
    return Math.min(100, Math.round((diffMs / oneYearMs) * 100));
  };

  // Функция для получения текста прогресса
  const getProgressText = () => {
    const percentage = calculateYearPercentage();
    
    if (percentage === 0) {
      return 'Вы только что зарегистрировались';
    } else if (percentage < 25) {
      return 'Вы новичок на сайте';
    } else if (percentage < 50) {
      return 'Вы активный пользователь';
    } else if (percentage < 75) {
      return 'Вы опытный пользователь';
    } else if (percentage < 100) {
      return 'Вы почти с нами год!';
    } else {
      return 'Вы с нами уже больше года!';
    }
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

  // Функция для сброса даты регистрации (для тестирования)
  const resetRegistrationDate = () => {
    if (user?.id) {
      localStorage.removeItem(`user_registration_${user.id}`);
      const newDate = new Date();
      localStorage.setItem(`user_registration_${user.id}`, newDate.toISOString());
      setRegistrationDate(newDate);
      setMessage({ type: 'info', text: 'Дата регистрации сброшена!' });
    }
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
                        <strong>На сайте:</strong> {calculateTimeSinceRegistration()}
                      </div>

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