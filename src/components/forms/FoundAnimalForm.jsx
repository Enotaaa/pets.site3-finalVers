import React, { useState } from 'react';
import { useAuth } from "../auth/AuthContext";

const FoundAnimalForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    kind: '',
    description: '',
    district: '',
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    mark: '',
    confirm: false
  });
  
  const [images, setImages] = useState([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    password_confirmation: ''
  });

  const districts = [
    'Адмиралтейский район',
    'Василеостровский район',
    'Выборгский район',
    'Калининский район',
    'Кировский район',
    'Колпинский район',
    'Красногвардейский район',
    'Красносельский район',
    'Кронштадтский район',
    'Курортный район',
    'Московский район',
    'Невский район',
    'Петроградский район',
    'Петродворцовый район',
    'Приморский район',
    'Пушкинский район',
    'Фрунзенский район',
    'Центральный район'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.kind.trim()) {
      newErrors.kind = 'Укажите вид животного';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Введите описание';
    }
    
    if (!formData.district) {
      newErrors.district = 'Выберите район';
    }
    
    if (!images[0]) {
      newErrors.photo1 = 'Добавьте хотя бы одну фотографию';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Введите ваше имя';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.confirm) {
      newErrors.confirm = 'Необходимо согласие';
    }
    
    return newErrors;
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...imagePreviews];
      newPreviews[index] = e.target.result;
      setImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);
    
    if (errors[`photo${index + 1}`]) {
      setErrors(prev => ({ ...prev, [`photo${index + 1}`]: null }));
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    
    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });
    
    // Первый шаг: проверка основной формы
    if (!showPasswordFields) {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setShowPasswordFields(true);
      return;
    }
    
    // Второй шаг: проверка пароля
    if (!passwordData.password) {
      setErrors(prev => ({ ...prev, password: 'Введите пароль' }));
      return;
    }
    
    if (!user && passwordData.password !== passwordData.password_confirmation) {
      setErrors(prev => ({ ...prev, password_confirmation: 'Пароли не совпадают' }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const apiFormData = new FormData();
      
      // Добавляем изображения
      images.forEach((image, index) => {
        if (image) {
          apiFormData.append(`photo${index + 1}`, image);
        }
      });
      
      // Добавляем данные формы
      Object.keys(formData).forEach(key => {
        if (key !== 'confirm') {
          apiFormData.append(key, formData[key]);
        } else {
          apiFormData.append(key, formData[key] ? 1 : 0);
        }
      });
      
      // Добавляем пароль
      apiFormData.append('password', passwordData.password);
      if (!user) {
        apiFormData.append('password_confirmation', passwordData.password_confirmation);
      }
      
      // Настраиваем заголовки
      const headers = {};
      if (user) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch('https://pets.xn--80ahdri7a.site/api/pets', {
        method: 'POST',
        headers,
        body: apiFormData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Объявление успешно создано!' });
        
        // Сброс формы
        setTimeout(() => {
          setFormData({
            kind: '',
            description: '',
            district: '',
            name: user?.name || '',
            phone: user?.phone || '',
            email: user?.email || '',
            mark: '',
            confirm: false
          });
          setImages([null, null, null]);
          setImagePreviews([]);
          setPasswordData({ password: '', password_confirmation: '' });
          setShowPasswordFields(false);
          
          // Закрываем модальное окно
          const closeBtn = document.querySelector('[data-bs-dismiss="modal"]');
          if (closeBtn) closeBtn.click();
        }, 2000);
      } else {
        setMessage({ type: 'danger', text: result.message || 'Ошибка при создании объявления' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Ошибка сети' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setMessage({ type: '', text: '' });
    setShowPasswordFields(false);
  };

  return (
    <div className="modal fade" id="newPost" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Сообщить о находке</h5>
            <button 
              type="button" 
              className="btn-close" 
              data-bs-dismiss="modal"
              onClick={handleCancel}
            />
          </div>
          
          <div className="modal-body">
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}
            
            {user && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Вы авторизованы как <strong>{user.name}</strong>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Вид животного *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.kind ? 'is-invalid' : ''}`}
                      name="kind"
                      value={formData.kind}
                      onChange={handleInputChange}
                      placeholder="Кот, собака, кролик и т.д."
                      disabled={isSubmitting}
                    />
                    {errors.kind && (
                      <div className="invalid-feedback">{errors.kind}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Ваше имя *</label>
                    {user ? (
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={user.name}
                        readOnly
                        disabled
                      />
                    ) : (
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Иван Иванов"
                        disabled={isSubmitting}
                      />
                    )}
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Метка/Особенности</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mark"
                      value={formData.mark}
                      onChange={handleInputChange}
                      placeholder="Приучен к лотку, знает команды и т.д."
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Телефон *</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 999-99-99 или любой другой формат"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                    <small className="text-muted">Любой формат телефона</small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Район находки *</label>
                    <select
                      className={`form-select ${errors.district ? 'is-invalid' : ''}`}
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Выберите район</option>
                      {districts.map((district, index) => (
                        <option key={index} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && (
                      <div className="invalid-feedback">{errors.district}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    {user ? (
                      <input
                        type="email"
                        className="form-control bg-light"
                        value={user.email}
                        readOnly
                        disabled
                      />
                    ) : (
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        disabled={isSubmitting}
                      />
                    )}
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Фотографии *</label>
                    <input
                      type="file"
                      className={`form-control ${errors.photo1 ? 'is-invalid' : ''}`}
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 0)}
                      disabled={isSubmitting}
                    />
                    <small className="text-muted">Первая фотография обязательна</small>
                    {errors.photo1 && (
                      <div className="invalid-feedback">{errors.photo1}</div>
                    )}
                    
                    <input
                      type="file"
                      className="form-control mt-2"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 1)}
                      disabled={isSubmitting}
                    />
                    
                    <input
                      type="file"
                      className="form-control mt-2"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 2)}
                      disabled={isSubmitting}
                    />
                    
                    {imagePreviews.some(preview => preview) && (
                      <div className="row mt-3">
                        {imagePreviews.map((preview, index) => (
                          preview && (
                            <div key={index} className="col-4">
                              <div className="position-relative">
                                <img
                                  src={preview}
                                  className="img-thumbnail w-100"
                                  alt={`Preview ${index + 1}`}
                                  style={{ height: '100px', objectFit: 'cover' }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                  onClick={() => removeImage(index)}
                                  disabled={isSubmitting}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Описание животного *</label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Опишите животное, его поведение, состояние здоровья и т.д."
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>
              
              {/* Поля пароля */}
              {showPasswordFields && (
                <div className="border-top pt-3 mt-3">
                  <h6>Подтверждение пароля</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Пароль *</label>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          name="password"
                          value={passwordData.password}
                          onChange={handlePasswordChange}
                          placeholder="Введите пароль"
                          disabled={isSubmitting}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                        <small className="text-muted">
                          {user ? 'Введите пароль для подтверждения' : 'Минимум 6 символов'}
                        </small>
                      </div>
                    </div>
                    
                    {!user && (
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Подтверждение пароля *</label>
                          <input
                            type="password"
                            className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                            name="password_confirmation"
                            value={passwordData.password_confirmation}
                            onChange={handlePasswordChange}
                            placeholder="Повторите пароль"
                            disabled={isSubmitting}
                          />
                          {errors.password_confirmation && (
                            <div className="invalid-feedback">{errors.password_confirmation}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className={`form-check-input ${errors.confirm ? 'is-invalid' : ''}`}
                  name="confirm"
                  checked={formData.confirm}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label className="form-check-label">
                  Я согласен на обработку персональных данных *
                </label>
                {errors.confirm && (
                  <div className="invalid-feedback">{errors.confirm}</div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  data-bs-dismiss="modal"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Отправка...
                    </>
                  ) : showPasswordFields ? 'Создать объявление' : 'Далее → Ввести пароль'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundAnimalForm;