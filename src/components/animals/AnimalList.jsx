import React, { useState, useEffect, useMemo } from 'react';
import AnimalCard from './AnimalCard';

const AnimalList = ({ limit = null, filters = {}, itemsPerPage = 6, showPaginationInfo = false }) => {
  const [animals, setAnimals] = useState([]);
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // Сбрасываем состояние при размонтировании компонента
      setAnimals([]);
      setAllAnimals([]);
      setLoading(false);
    };
  }, []);

  // Рассчитываем пагинацию
  const { paginatedAnimals, totalPages, startIndex, endIndex } = useMemo(() => {
    if (limit) {
      // Если есть лимит, показываем ограниченное количество без пагинации
      return {
        paginatedAnimals: animals.slice(0, limit),
        totalPages: 1,
        startIndex: 1,
        endIndex: Math.min(limit, animals.length)
      };
    }

    const total = animals.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, total);
    const paginatedAnimals = animals.slice(startIndex, endIndex);
    
    return {
      paginatedAnimals,
      totalPages,
      startIndex: startIndex + 1,
      endIndex
    };
  }, [animals, currentPage, itemsPerPage, limit]);

  // Функции для управления пагинацией
  const handleNextPage = () => {
    if (currentPage < Math.ceil(animals.length / itemsPerPage)) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

        // Фильтр по району (нестрогий поиск)
        if (filters.district && filters.district !== 'Все районы') {
          filteredAnimals = filteredAnimals.filter(animal => {
            if (!animal.district) return false;
            return animal.district.toLowerCase().includes(filters.district.toLowerCase());
          });
        }

        // Сортируем по дате (новые первыми) - более надежный способ
        filteredAnimals.sort((a, b) => {
          try {
            // Преобразуем даты в формат YYYY-MM-DD для сравнения
            const getDateValue = (dateStr) => {
              if (!dateStr) return 0;
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
              }
              return 0;
            };
            
            const dateA = getDateValue(a.date);
            const dateB = getDateValue(b.date);
            return dateB - dateA; // Сортируем от новых к старым
          } catch (e) {
            return 0;
          }
        });

        // Сохраняем все отфильтрованные животные
        setAllAnimals(filteredAnimals);
        
        // Если есть лимит, берем только первые N
        if (limit) {
          setAnimals(filteredAnimals.slice(0, limit));
        } else {
          setAnimals(filteredAnimals);
        }
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
    if (isMounted && allAnimals.length > 0) {
      // Перезагружаем с текущими фильтрами
      fetchAnimals();
    }
  }, [filters, isMounted]);

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
          {filters.district && filters.district !== 'Все районы'
            ? `Животные в районе "${filters.district}" не найдены`
            : 'Животные не найдены'
          }
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
          <span className="badge bg-primary me-2">
            Всего найдено: {animals.length}
          </span>
          {!limit && animals.length > itemsPerPage && (
            <span className="badge bg-info">
              Страница {currentPage} из {totalPages}
            </span>
          )}
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
      
      {/* Пагинация сверху, если показываем информацию о ней */}
      {!limit && animals.length > itemsPerPage && showPaginationInfo && (
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Показано {startIndex}-{endIndex} из {animals.length} объявлений
            </small>
            <small className="text-muted">
              Страница {currentPage} из {totalPages}
            </small>
          </div>
        </div>
      )}
      
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {paginatedAnimals.map((animal) => (
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
      
      {/* Пагинация снизу */}
      {!limit && animals.length > itemsPerPage && (
        <nav aria-label="Навигация по страницам" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i> Назад
              </button>
            </li>
            
            {/* Страницы */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <li 
                    key={pageNum} 
                    className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link" 
                      onClick={() => handlePageClick(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              }
              return null;
            })}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Вперед <i className="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}
      
      {/* Информация о лимите (только для HomePage) */}
      {limit && allAnimals.length > limit && (
        <div className="mt-4 text-center">
          <div className="alert alert-light">
            <p className="mb-0">
              Показано {limit} из {allAnimals.length} последних объявлений
            </p>
            <button 
              className="btn btn-outline-primary btn-sm mt-2"
              onClick={() => window.location.href = '/find-animals'}
            >
              Показать все объявления
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalList;