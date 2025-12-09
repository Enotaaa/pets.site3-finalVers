import React, { useState, useEffect } from 'react';

const AnimalModal = ({ animalId, onClose }) => {
  const [animalInfo, setAnimalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    const fetchPetData = async () => {
      if (!animalId) {
        setError("ID питомца не указан");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://pets.xn--80ahdri7a.site/api/pets/${animalId}`,
          { headers: { 'Accept': 'application/json' } }
        );

        if (response.status === 404 || response.status === 204) {
          setError("Информация о питомце не найдена");
          setAnimalInfo(null);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result?.data?.pet) {
          const petData = result.data.pet;
          
          // Обрабатываем фото
          let photos = [];
          if (petData.photos && Array.isArray(petData.photos)) {
            photos = petData.photos
              .filter(photo => photo)
              .map(photo => {
                if (photo && !photo.startsWith('http') && !photo.startsWith('data:')) {
                  if (photo.startsWith('/')) {
                    return `https://pets.xn--80ahdri7a.site${photo}`;
                  }
                  return `https://pets.xn--80ahdri7a.site/${photo}`;
                }
                return photo;
              });
          }
          
          const formattedPetData = {
            id: petData.id || animalId,
            name: petData.name || "",
            kind: petData.kind || "",
            district: petData.district || "",
            date: petData.date || "",
            mark: petData.mark || "",
            description: petData.description || "",
            phone: petData.phone || "",
            email: petData.email || "",
            photos: photos,
            foundBy: petData.name || "",
          };
          
          setAnimalInfo(formattedPetData);
        } else {
          setError("Питомец не найден в базе данных");
          setAnimalInfo(null);
        }
      } catch (error) {
        setError(`Ошибка соединения: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [animalId]);

  const handleAdopt = () => {
    if (animalInfo) {
      setIsInterested(true);
      const contactInfo = animalInfo.phone || animalInfo.email || 'контактной информации';
      alert(`Вы проявили интерес к ${animalInfo.name || animalInfo.kind || 'питомцу'}. Мы свяжемся с вами по ${contactInfo}!`);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('pet-modal-backdrop')) {
      onClose();
    }
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return '';
    if (photoPath.startsWith('http')) return photoPath;
    return `https://pets.xn--80ahdri7a.site${photoPath}`;
  };

  if (!animalId) return null;

  return (
    <div 
      className="pet-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="pet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {loading ? (
            <h5 className="modal-title">Загрузка...</h5>
          ) : error || !animalInfo ? (
            <h5 className="modal-title">Ошибка</h5>
          ) : (
            <h5 className="modal-title">{animalInfo.kind || "Животное"}</h5>
          )}
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Закрыть"
          />
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
              <p className="mt-2">Загрузка информации о питомце...</p>
            </div>
          ) : error || !animalInfo ? (
            <div className="text-center py-5">
              <p className="text-danger">{error || "Информация о питомце не найдена"}</p>
              <p className="text-muted">ID питомца: {animalId}</p>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-6">
                <div className="animal-images mb-3">
                  {animalInfo.photos && animalInfo.photos.length > 0 ? (
                    <>
                      <img 
                        src={getImageUrl(animalInfo.photos[0])}
                        className="img-fluid rounded mb-3"
                        alt={animalInfo.kind}
                        style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%236c757d' text-anchor='middle' dy='.3em'%3EНет фото%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      
                      {animalInfo.photos.length > 1 && (
                        <div className="d-flex flex-wrap">
                          {animalInfo.photos.slice(1).map((photo, index) => (
                            <div key={index} className="me-2 mb-2">
                              <img 
                                src={getImageUrl(photo)}
                                className="img-thumbnail"
                                alt={`${animalInfo.kind} фото ${index + 1}`}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => {
                                  const mainImg = document.querySelector('.animal-images img');
                                  if (mainImg) mainImg.src = getImageUrl(photo);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-5 bg-light rounded">
                      <i className="bi bi-image display-1 text-muted"></i>
                      <p className="text-muted mt-2">Нет изображения</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="animal-details">
                  <h6 className="border-bottom pb-2 mb-3">Информация о находке</h6>
                  
                  <div className="mb-3">
                    <p><strong>Вид животного:</strong> {animalInfo.kind || "Не указан"}</p>
                    <p><strong>Имя:</strong> {animalInfo.name || "Не указано"}</p>
                    <p><strong>Район находки:</strong> {animalInfo.district || "Не указан"}</p>
                    <p><strong>Дата находки:</strong> {animalInfo.date || "Не указана"}</p>
                    {animalInfo.mark && (
                      <p><strong>Метка/клеймо:</strong> {animalInfo.mark}</p>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <p><strong>Описание:</strong></p>
                    <div className="bg-light p-3 rounded">
                      {animalInfo.description || "Нет описания"}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="border-bottom pb-2 mb-3">Контактная информация</h6>
                    {animalInfo.phone && (
                      <p><strong>Телефон:</strong> {animalInfo.phone}</p>
                    )}
                    {animalInfo.email && (
                      <p><strong>Email:</strong> {animalInfo.email}</p>
                    )}
                    {!animalInfo.phone && !animalInfo.email && (
                      <p className="text-muted">Контактная информация не указана</p>
                    )}
                  </div>
                  
                  {animalInfo.foundBy && (
                    <p className="text-muted small">
                      <i className="bi bi-person me-1"></i>
                      Нашёл: {animalInfo.foundBy}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {(!loading && animalInfo) && (
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Закрыть
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleAdopt}
              disabled={isInterested}
            >
              {isInterested ? (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Заявка отправлена
                </>
              ) : (
                <>
                  <i className="bi bi-heart me-2"></i>
                  Проявить интерес
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalModal;