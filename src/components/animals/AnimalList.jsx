import React, { useState, useEffect, useRef } from 'react';
import AnimalCard from './AnimalCard';

const AnimalList = ({ limit = null, filters = {} }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // Сбрасываем состояние при размонтировании компонента
      setAnimals([]);
      setLoading(false);
    };
  }, []);

  const fetchAnimals = async () => {
    if (!isMounted) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('Загружаем данные о животных...');
      const response = await fetch('https://pets.xn--80ahdri7a.site/api/pets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!isMounted) return;
      
      if (data.data?.orders) {
        let filteredAnimals = data.data.orders.filter(animal => animal.registred);
        
        // Применяем фильтры
        if (filters.animalType && filters.animalType !== 'all') {
          filteredAnimals = filteredAnimals.filter(animal => {
            const kind = animal.kind?.toLowerCase() || '';
            switch (filters.animalType) {
              case 'cat':
                return kind.includes('кот') || kind.includes('кошка');
              case 'dog':
                return kind.includes('собака');
              case 'rabbit':
                return kind.includes('кролик');
              case 'other':
                return !kind.includes('кот') && !kind.includes('кошка') && 
                       !kind.includes('собака') && !kind.includes('кролик');
              default:
                return true;
            }
          });
        }

        // Фильтр по дате
        if (filters.dateRange && filters.dateRange !== 'all') {
          const now = new Date();
          filteredAnimals = filteredAnimals.filter(animal => {
            if (!animal.date) return true;
            
            try {
              const [day, month, year] = animal.date.split('-');
              const animalDate = new Date(year, month - 1, day);
              const diffTime = Math.abs(now - animalDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              switch (filters.dateRange) {
                case 'week': return diffDays <= 7;
                case 'month': return diffDays <= 30;
                case 'older': return diffDays > 30;
                default: return true;
              }
            } catch (e) {
              return true;
            }
          });
        }

        // Сортируем по дате (новые первыми)
        filteredAnimals.sort((a, b) => {
          try {
            const dateA = a.date ? a.date.split('-').reverse().join('-') : '';
            const dateB = b.date ? b.date.split('-').reverse().join('-') : '';
            return dateB.localeCompare(dateA);
          } catch (e) {
            return 0;
          }
        });

        // Ограничиваем количество, если указано
        if (limit) {
          filteredAnimals = filteredAnimals.slice(0, limit);
        }

        setAnimals(filteredAnimals);
      }
    } catch (error) {
      if (!isMounted) return;
      console.error('Error fetching animals:', error);
      setError('Не удалось загрузить данные о животных');
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  // Загружаем данные при монтировании
  useEffect(() => {
    if (isMounted) {
      fetchAnimals();
    }
  }, [isMounted]);

  // Обновляем фильтрацию при изменении фильтров
  useEffect(() => {
    if (isMounted && animals.length > 0) {
      // Перезагружаем с текущими фильтрами
      fetchAnimals();
    }
  }, [filters, isMounted]);

  if (loading && animals.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка животных...</p>
      </div>
    );
  }

  if (error && animals.length === 0) {
    return (
      <div className="alert alert-danger text-center">
        <p>{error}</p>
        <button 
          className="btn btn-primary mt-2"
          onClick={() => fetchAnimals()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Животные не найдены
          <div className="mt-2">
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => fetchAnimals()}
            >
              Обновить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animal-list">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <span className="badge bg-primary">
            Найдено: {animals.length}
          </span>
        </div>
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => fetchAnimals()}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1"></span>
              Обновление...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Обновить
            </>
          )}
        </button>
      </div>
      
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {animals.map((animal) => (
          <div key={animal.id} className="col">
            <AnimalCard 
              animal={animal}
              onViewClick={() => {
                window.dispatchEvent(new CustomEvent('openAnimalModal', { 
                  detail: { animalId: animal.id } 
                }));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimalList;