import React, { useState } from 'react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'danger', text: 'Введите email' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'danger', text: 'Введите корректный email' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('https://pets.xn--80ahdri7a.site/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Вы успешно подписались на новости!' });
        setEmail('');
      } else {
        setMessage({ type: 'danger', text: 'Ошибка при подписке. Попробуйте позже.' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Ошибка сети' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="newsletter-section bg-dark text-white py-5 mt-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <h2>Подписка на новости</h2>
            <p className="lead mb-4">
              Будьте в курсе новых объявлений и событий
            </p>
            
            <form onSubmit={handleSubmit} className="w-50 mx-auto" style={{ minWidth: '300px' }}>
              {message.text && (
                <div className={`alert alert-${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <div className="input-group mb-3">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Ваш email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="btn btn-light"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Подписаться'}
                </button>
              </div>
              
              <small className="text-light">
                Мы никогда не делимся вашими данными с третьими лицами
              </small>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterForm;