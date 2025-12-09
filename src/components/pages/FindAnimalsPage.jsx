import React, { useState, useEffect, useMemo } from 'react';
import AnimalCard from '../animals/AnimalCard';
import { useNavigate, useLocation } from 'react-router-dom';

const FindAnimalsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [allAnimals, setAllAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnimalType, setSelectedAnimalType] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('Все районы');
  const itemsPerPage = 6;
  
  // Фильтры для животных
  const animalTypes = [
    { value: 'all', label: 'Все животные' },
    { value: 'cat', label: 'Коты' },
    { value: 'dog', label: 'Собаки' },
    { value: 'other', label: 'Другие' }
  ];

  const dateRanges = [
    { value: 'all', label: 'За всё время' },
    { value: 'today', label: 'Сегодня' },
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' }
  ];

  // Список районов для фильтрации
  const districts = [
    'Все районы',
    'Адмиралтейский',
    'Василеостровский',
    'Выборгский',
    'Калининский',
    'Кировский',
    'Колпинский',
    'Красногвардейский',
    'Красносельский',
    'Кронштадтский',
    'Курортный',
    'Московский',
    'Невский',
    'Петроградский',
    'Петродворцовый',
    'Приморский',
    'Пушкинский',
    'Фрунзенский',
    'Центральный'
  ];

  // Загружаем все объявления при монтировании компонента
  useEffect(() => {
    fetchAllAnimals();
    window.scrollTo(0, 0);
  }, []);

  // Обработка поискового запроса из URL при загрузке страницы
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Применяем фильтры при их изменении
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Сбрасываем на первую страницу при смене фильтра
  }, [selectedAnimalType, selectedDateRange, selectedDistrict, searchQuery, allAnimals]);

  const fetchAllAnimals = async () => {
    setLoading(true);
    try {
      // Запрашиваем все объявления без поискового запроса
      const url = 'https://pets.xn--80ahdri7a.site/api/search?query=';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке объявлений');
      }

      const result = await response.json();
      
      if (result.data && result.data.orders) {
        const processedAnimals = result.data.orders.map(order => ({
          id: order.id,
          kind: order.kind || "Животное",
          description: order.description || "Нет описания",
          date: order.date || "Дата не указана",
          district: order.district || "Район не указан",
          mark: order.mark || "Нет",
          photos: order.photos ? `https://pets.xn--80ahdri7a.site${order.photos}` : null,
          photo: order.photo ? `https://pets.xn--80ahdri7a.site${order.photo}` : null,
          name: order.name,
          phone: order.phone,
          email: order.email,
          animalType: order.animalType || 'other'
        }));
        setAllAnimals(processedAnimals);
        setFilteredAnimals(processedAnimals);
      } else {
        setAllAnimals([]);
        setFilteredAnimals([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки объявлений:", error);
      setAllAnimals([]);
      setFilteredAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allAnimals];

    // Фильтр по типу животного
    if (selectedAnimalType !== 'all') {
      filtered = filtered.filter(animal => {
        const kind = animal.kind?.toLowerCase() || '';
        if (selectedAnimalType === 'cat') {
          return kind.includes('кот') || kind.includes('кошка') || kind.includes('котик');
        } else if (selectedAnimalType === 'dog') {
          return kind.includes('собака') || kind.includes('пёс') || kind.includes('щенок');
        } else if (selectedAnimalType === 'other') {
          return !kind.includes('кот') && !kind.includes('кошка') && !kind.includes('котик') &&
                 !kind.includes('собака') && !kind.includes('пёс') && !kind.includes('щенок');
        }
        return true;
      });
    }

    // Фильтр по дате (упрощенный)
    if (selectedDateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(animal => {
        if (!animal.date) return false;
        
        const animalDate = new Date(animal.date);
        const diffTime = now - animalDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        switch (selectedDateRange) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Фильтр по району
    if (selectedDistrict !== 'Все районы') {
      filtered = filtered.filter(animal => 
        animal.district && animal.district.toLowerCase().includes(selectedDistrict.toLowerCase())
      );
    }

    // Фильтр по поисковому запросу
    if (searchQuery.trim().length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(animal => 
        (animal.kind && animal.kind.toLowerCase().includes(query)) ||
        (animal.description && animal.description.toLowerCase().includes(query)) ||
        (animal.district && animal.district.toLowerCase().includes(query)) ||
        (animal.mark && animal.mark.toLowerCase().includes(query))
      );
    }

    setFilteredAnimals(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchInput = e.target.querySelector('input[type="text"]');
    if (searchInput && searchInput.value.trim().length >= 3) {
      setSearchQuery(searchInput.value.trim());
      setCurrentPage(1);
      
      // Обновляем URL с поисковым запросом
      navigate(`/find-animals?search=${encodeURIComponent(searchInput.value.trim())}`);
    } else if (searchInput && searchInput.value.trim().length === 0) {
      setSearchQuery("");
      setCurrentPage(1);
      navigate('/find-animals');
    }
  };

  const handleAnimalTypeChange = (type) => {
    setSelectedAnimalType(type);
  };

  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
  };

  const handleResetFilters = () => {
    setSelectedAnimalType('all');
    setSelectedDateRange('all');
    setSelectedDistrict('Все районы');
    setSearchQuery("");
    setCurrentPage(1);
    navigate('/find-animals');
  };

  // Рассчитываем пагинацию для отфильтрованных результатов
  const { paginatedAnimals, totalPages, startIndex, endIndex } = useMemo(() => {
    const total = filteredAnimals.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, total);
    const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);
    
    return {
      paginatedAnimals,
      totalPages,
      startIndex: startIndex + 1,
      endIndex
    };
  }, [filteredAnimals, currentPage, itemsPerPage]);

  // Функции для управления пагинацией
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredAnimals.length / itemsPerPage)) {
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

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1>Найденные животные</h1>
        <p className="lead text-muted">
          Найдите питомца, который ищет дом, или помогите найти хозяина для найденного животного
        </p>
        
        {/* Поисковая строка */}
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group mb-4 shadow-sm">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Найти животное по описанию, породе, району..."
                  minLength={3}
                  defaultValue={searchQuery}
                />
                <button 
                  className="btn btn-primary btn-lg" 
                  type="submit"
                >
                  <i className="bi bi-search me-2"></i>
                  Найти
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Фильтры и статистика */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-funnel me-2"></i>
                Фильтры поиска
              </h5>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <h6>Тип животного:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {animalTypes.map((type) => (
                      <button
                        key={type.value}
                        className={`btn btn-sm ${selectedAnimalType === type.value ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleAnimalTypeChange(type.value)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <h6>Дата публикации:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {dateRanges.map((range) => (
                      <button
                        key={range.value}
                        className={`btn btn-sm ${selectedDateRange === range.value ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleDateRangeChange(range.value)}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <h6>Район Санкт-Петербурга:</h6>
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-primary dropdown-toggle w-100 text-start" 
                      type="button" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                    >
                      {selectedDistrict}
                    </button>
                    <ul className="dropdown-menu w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {districts.map((district) => (
                        <li key={district}>
                          <button 
                            className={`dropdown-item ${selectedDistrict === district ? 'active' : ''}`}
                            onClick={() => handleDistrictChange(district)}
                          >
                            {district}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <small className="text-muted mt-1 d-block">
                    {selectedDistrict === 'Все районы' ? 'Показывать все районы' : `Выбран: ${selectedDistrict}`}
                  </small>
                </div>
              </div>
              
              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="me-3 mb-2">
                      <span className="badge bg-info">
                        <i className="bi bi-card-list me-1"></i>
                        Всего: {allAnimals.length}
                      </span>
                    </div>
                    <div className="me-3 mb-2">
                      <span className="badge bg-success">
                        <i className="bi bi-filter me-1"></i>
                        Отфильтровано: {filteredAnimals.length}
                      </span>
                    </div>
                    {selectedDistrict !== 'Все районы' && (
                      <div className="mb-2">
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-geo-alt me-1"></i>
                          Район: {selectedDistrict}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="col-md-6 text-md-end">
                  {(selectedAnimalType !== 'all' || selectedDateRange !== 'all' || selectedDistrict !== 'Все районы' || searchQuery) && (
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleResetFilters}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Сбросить все фильтры
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Статистика поиска */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="search-stats mb-3">
            <p className="lead">
              Найдено объявлений: {loading ? '...' : filteredAnimals.length}
              {filteredAnimals.length > 0 && (
                <span className="ms-3 badge bg-info">
                  Страница {currentPage} из {totalPages}
                </span>
              )}
              {selectedAnimalType !== 'all' && (
                <span className="ms-2 badge bg-warning text-dark">
                  Тип: {animalTypes.find(t => t.value === selectedAnimalType)?.label}
                </span>
              )}
              {selectedDateRange !== 'all' && (
                <span className="ms-2 badge bg-warning text-dark">
                  Дата: {dateRanges.find(d => d.value === selectedDateRange)?.label}
                </span>
              )}
              {selectedDistrict !== 'Все районы' && (
                <span className="ms-2 badge bg-warning text-dark">
                  Район: {selectedDistrict}
                </span>
              )}
              {searchQuery && (
                <span className="ms-2 badge bg-warning text-dark">
                  Поиск: "{searchQuery}"
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="col-12 text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Загружаем все объявления о животных...</p>
        </div>
      ) : filteredAnimals.length === 0 ? (
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-search display-1 text-muted mb-4"></i>
              <h4>
                {searchQuery 
                  ? `По вашему запросу "${searchQuery}" ничего не найдено`
                  : selectedAnimalType !== 'all' || selectedDateRange !== 'all' || selectedDistrict !== 'Все районы'
                  ? 'По выбранным фильтрам ничего не найдено'
                  : 'Объявления о животных отсутствуют'
                }
              </h4>
              <p className="text-muted mt-3">
                {searchQuery || selectedAnimalType !== 'all' || selectedDateRange !== 'all' || selectedDistrict !== 'Все районы'
                  ? 'Попробуйте изменить фильтры поиска'
                  : 'Попробуйте зайти позже'
                }
              </p>
              {(searchQuery || selectedAnimalType !== 'all' || selectedDateRange !== 'all' || selectedDistrict !== 'Все районы') && (
                <button 
                  className="btn btn-primary mt-2"
                  onClick={handleResetFilters}
                >
                  Показать все объявления
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {paginatedAnimals.map((animal) => (
              <div key={animal.id} className="col-md-6 col-lg-4">
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
          
          {/* Пагинация для результатов поиска */}
          {filteredAnimals.length > itemsPerPage && (
            <nav aria-label="Навигация по страницам поиска" className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <small className="text-muted">
                    Показано {startIndex}-{endIndex} из {filteredAnimals.length} объявлений
                  </small>
                </div>
                <div>
                  <small className="text-muted">
                    Страница {currentPage} из {totalPages}
                  </small>
                </div>
              </div>
              
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
          
          {/* Статистика поиска */}
          <div className="mt-5 pt-4 border-top">
            <div className="row">
              <div className="col-md-6">
                <div className="alert alert-light">
                  <h5 className="alert-heading">
                    <i className="bi bi-info-circle me-2"></i>
                    Информация о поиске
                  </h5>
                  <p className="mb-0">
                    Всего объявлений в базе: <strong>{allAnimals.length}</strong>
                  </p>
                  {searchQuery && (
                    <p className="mb-0 mt-1">
                      Найдено по запросу "{searchQuery}": <strong>{filteredAnimals.length}</strong> объявлений
                    </p>
                  )}
                  {selectedAnimalType !== 'all' && (
                    <p className="mb-0 mt-1">
                      Отфильтровано по типу: <strong>{animalTypes.find(t => t.value === selectedAnimalType)?.label}</strong>
                    </p>
                  )}
                  {selectedDateRange !== 'all' && (
                    <p className="mb-0 mt-1">
                      Отфильтровано по дате: <strong>{dateRanges.find(d => d.value === selectedDateRange)?.label}</strong>
                    </p>
                  )}
                  {selectedDistrict !== 'Все районы' && (
                    <p className="mb-0 mt-1">
                      Отфильтровано по району: <strong>{selectedDistrict}</strong>
                    </p>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="alert alert-light">
                  <h5 className="alert-heading">
                    <i className="bi bi-lightbulb me-2"></i>
                    Советы по поиску
                  </h5>
                  <p className="mb-0">
                    Используйте все фильтры для максимального уточнения поиска
                  </p>
                  <p className="mb-0 mt-1">
                    Для точного поиска используйте 3 и более символов в поисковой строке
                  </p>
                  <p className="mb-0 mt-1">
                    Фильтр по району ищет частичное совпадение в названии района
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Информационный блок */}
      <div className="row mt-5 mb-5">
        <div className="col-md-8 mx-auto">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h5 className="card-title">Не нашли подходящее животное?</h5>
              <p className="card-text">
                Возможно, вам стоит заглянуть позже или разместить объявление о находке.
              </p>
              <button 
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#newPost"
              >
                Сообщить о находке
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindAnimalsPage;