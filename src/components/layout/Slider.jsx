import React, { useState, useEffect } from 'react';

const Slider = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSliderData();
  }, []);

  const fetchSliderData = async () => {
    try {
      const response = await fetch('https://pets.xn--80ahdri7a.site/api/pets/slider');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки слайдера');
      }
      
      const data = await response.json();
      
      if (data.data?.pets) {
        setPets(data.data.pets);
      }
    } catch (error) {
      console.error('Slider error:', error);
      setError('Не удалось загрузить слайдер');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="slider-loading text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error || pets.length === 0) {
    return null;
  }

  return (
    <div className="fullscreen-slider-container">
      <div id="animalCarousel" className="carousel slide" data-bs-ride="carousel">
        {/* Овальные индикаторы сверху */}
        <div className="carousel-indicators" style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          right: '0',
          margin: '0 auto',
          zIndex: 10
        }}>
          {pets.map((_, index) => (
            <button 
              key={index}
              type="button" 
              data-bs-target="#animalCarousel" 
              data-bs-slide-to={index}
              className={index === 0 ? 'active' : ''}
              style={{
                width: '30px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                margin: '0 5px',
                opacity: '0.7',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
        
        <div className="carousel-inner">
          {pets.map((pet, index) => (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
              <div className="carousel-image-container">
                {pet.image ? (
                  <img 
                    src={`https://pets.xn--80ahdri7a.site${pet.image}`}
                    className="d-block w-100"
                    alt={pet.kind}
                  />
                ) : (
                  <div className="d-block w-100 bg-secondary no-image-placeholder">
                    <div className="h-100 d-flex align-items-center justify-content-center text-white">
                      <div>
                        <i className="bi bi-image fs-1 d-block"></i>
                        <span>Изображение отсутствует</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="carousel-caption d-none d-md-block">
                <div className="bg-dark bg-opacity-75 rounded p-3">
                  <h5>{pet.kind || 'Животное'}</h5>
                  <p className="mb-0">{pet.description || 'Описание отсутствует'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="carousel-control-prev" type="button" data-bs-target="#animalCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Предыдущий</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#animalCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Следующий</span>
        </button>
      </div>
    </div>
  );
};

export default Slider;