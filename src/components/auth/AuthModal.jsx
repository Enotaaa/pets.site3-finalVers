import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import RegistrationForm from './RegistrationForm';

const AuthModal = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const { login } = useAuth();

  const validateLoginForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });

    const validationErrors = validateLoginForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      setMessage({ type: 'success', text: 'Успешный вход!' });
      setTimeout(() => {
        document.getElementById('closeAuthModal')?.click();
      }, 1000);
    } else {
      setMessage({ type: 'danger', text: result.error });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="modal fade" id="authModal" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isLoginMode ? 'Вход в аккаунт' : 'Регистрация'}
            </h5>
            <button 
              id="closeAuthModal"
              type="button" 
              className="btn-close" 
              data-bs-dismiss="modal"
              onClick={() => {
                setErrors({});
                setMessage({ type: '', text: '' });
                setFormData({ email: '', password: '' });
              }}
            />
          </div>
          
          <div className="modal-body">
            <div className="mb-3">
              <div className="btn-group w-100">
                <button
                  type="button"
                  className={`btn ${isLoginMode ? 'btn-dark' : 'btn-outline-dark'}`}
                  onClick={() => setIsLoginMode(true)}
                >
                  Вход
                </button>
                <button
                  type="button"
                  className={`btn ${!isLoginMode ? 'btn-dark' : 'btn-outline-dark'}`}
                  onClick={() => setIsLoginMode(false)}
                >
                  Регистрация
                </button>
              </div>
            </div>

            {isLoginMode ? (
              <form onSubmit={handleLogin}>
                {message.text && (
                  <div className={`alert alert-${message.type}`}>
                    {message.text}
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Пароль</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Пароль"
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                
                <div className="form-text mb-3">
                  Тестовый аккаунт: user@user.rl / paSSword1
                </div>
              </form>
            ) : (
              <RegistrationForm />
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              Закрыть
            </button>
            <button 
              type="button" 
              className="btn btn-dark"
              onClick={isLoginMode ? handleLogin : undefined}
            >
              {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;