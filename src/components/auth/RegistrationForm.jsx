import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    confirm: false
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (!/^[А-Яа-яЁё\s-]+$/.test(formData.name)) {
      newErrors.name = 'Только кириллица, пробелы и дефисы';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 7) {
      newErrors.password = 'Минимум 7 символов';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Должна быть хотя бы одна цифра';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Должна быть хотя бы одна строчная буква';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Должна быть хотя бы одна заглавная буква';
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Пароли не совпадают';
    }
    
    if (!formData.confirm) {
      newErrors.confirm = 'Необходимо согласие';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    const registrationData = {
      ...formData,
      confirm: formData.confirm ? 1 : 0
    };
    
    const result = await register(registrationData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Регистрация успешна! Теперь вы можете войти.' });
      
      // Очищаем форму
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        confirm: false
      });
      
      // Переключаем на вход
      setTimeout(() => {
        const loginBtn = document.querySelector('[onClick*="setIsLoginMode(true)"]');
        if (loginBtn) loginBtn.click();
      }, 2000);
    } else {
      setMessage({ type: 'danger', text: result.error });
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-3">
        <label className="form-label">Имя *</label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Иван Иванов"
        />
        {errors.name && (
          <div className="invalid-feedback">{errors.name}</div>
        )}
        <small className="text-muted">Только кириллица, пробелы и дефисы</small>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Телефон *</label>
        <input
          type="tel"
          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+79001234567"
        />
        {errors.phone && (
          <div className="invalid-feedback">{errors.phone}</div>
        )}
        <small className="text-muted">Любой формат телефона</small>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Email *</label>
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="user@example.ru"
        />
        {errors.email && (
          <div className="invalid-feedback">{errors.email}</div>
        )}
      </div>
      
      <div className="mb-3">
        <label className="form-label">Пароль *</label>
        <input
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="paSSword1"
        />
        {errors.password && (
          <div className="invalid-feedback">{errors.password}</div>
        )}
        <small className="text-muted">Минимум 7 символов: 1 цифра, 1 строчная и 1 заглавная буква</small>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Подтверждение пароля *</label>
        <input
          type="password"
          className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
          name="password_confirmation"
          value={formData.password_confirmation}
          onChange={handleInputChange}
          placeholder="paSSword1"
        />
        {errors.password_confirmation && (
          <div className="invalid-feedback">{errors.password_confirmation}</div>
        )}
      </div>
      
      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className={`form-check-input ${errors.confirm ? 'is-invalid' : ''}`}
          name="confirm"
          checked={formData.confirm}
          onChange={handleInputChange}
        />
        <label className="form-check-label">
          Я согласен на обработку персональных данных *
        </label>
        {errors.confirm && (
          <div className="invalid-feedback">{errors.confirm}</div>
        )}
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary w-100"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
};

export default RegistrationForm;