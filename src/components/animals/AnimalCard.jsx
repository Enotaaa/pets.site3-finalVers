import React from 'react';

const AnimalCard = ({ animal, onViewClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    if (dateString.includes('-')) {
      const [day, month, year] = dateString.split('-');
      return `${day}.${month}.${year}`;
    }
    return dateString;
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return '';
    if (photoPath.startsWith('http')) return photoPath;
    return `https://pets.xn--80ahdri7a.site${photoPath}`;
  };

  const getAnimalTypeFromKind = (kind) => {
    const kindLower = kind?.toLowerCase() || '';
    if (kindLower.includes('кошка') || kindLower.includes('кот')) return 'cat';
    if (kindLower.includes('собака')) return 'dog';
    if (kindLower.includes('кролик')) return 'rabbit';
    return 'other';
  };

  const getTypeBadgeClass = (type) => {
    switch(type) {
      case 'cat': return 'badge bg-info';
      case 'dog': return 'badge bg-warning text-dark';
      case 'rabbit': return 'badge bg-purple';
      default: return 'badge bg-secondary';
    }
  };

  const getTypeText = (type) => {
    switch(type) {
      case 'cat': return 'Кошка';
      case 'dog': return 'Собака';
      case 'rabbit': return 'Кролик';
      default: return 'Другое';
    }
  };

  const animalType = getAnimalTypeFromKind(animal.kind);

  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick(animal.id);
    } else {
      // Если нет callback, отправляем глобальное событие
      window.dispatchEvent(new CustomEvent('openAnimalModal', { 
        detail: { animalId: animal.id } 
      }));
    }
  };

  return (
    <div className="card animal-card h-100 shadow-sm">
      <div className="position-relative">
        <img 
          src={getImageUrl(animal.photo || animal.photos)}
          className="card-img-top"
          alt={animal.kind || 'Животное'}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%236c757d' text-anchor='middle' dy='.3em'%3EНет фото%3C/text%3E%3C/svg%3E";
          }}
        />
        <div className="position-absolute top-0 end-0 m-2">
          <span className={getTypeBadgeClass(animalType)}>
            {getTypeText(animalType)}
          </span>
        </div>
      </div>
      
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{animal.kind || 'Животное'}</h5>
        
        <div className="mb-2">
          <small className="text-muted">
            <i className="bi bi-geo-alt me-1"></i>
            {animal.district || 'Район не указан'}
          </small>
        </div>
        
        <p className="card-text flex-grow-1" style={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {animal.description || 'Нет описания'}
        </p>
        
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-light text-dark">
              <i className="bi bi-calendar me-1"></i>
              {formatDate(animal.date)}
            </span>
            {animal.mark && (
              <span className="badge bg-dark">
                <i className="bi bi-tag me-1"></i>
                {animal.mark}
              </span>
            )}
          </div>
          
          <button 
            className="btn btn-primary w-100"
            onClick={handleViewClick}
          >
            <i className="bi bi-eye me-2"></i>
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;