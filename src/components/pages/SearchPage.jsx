import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnimalCard from '../animals/AnimalCard';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || "";
    setSearchQuery(query);
    
    if (query.length >= 3) {
      performSearch(query);
    } else {
      setSearchResults([]);
    }
  }, [location.search]);

  // Закрытие подсказок при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const url = `https://pets.xn--80ahdri7a.site/api/search?query=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при поиске');
      }

      const result = await response.json();
      
      if (result.data && result.data.orders) {
        const processedSuggestions = result.data.orders.map(order => ({
          id: order.id,
          kind: order.kind || "Животное",
          description: order.description || "Нет описания",
          date: order.date || "Дата не указана",
          district: order.district || "Район не указан",
          mark: order.mark || "Нет",
          photos: order.photos ? `https://pets.xn--80ahdri7a.site${order.photos}` : null,
          photo: order.photo ? `https://pets.xn--80ahdri7a.site${order.photo}` : null,
        }));
        setSuggestions(processedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Ошибка поиска:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const performSearch = async (query) => {
    if (query.length < 3) return;
    
    setLoading(true);
    try {
      const url = `https://pets.xn--80ahdri7a.site/api/search?query=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при поиске');
      }

      const result = await response.json();
      
      if (result.data && result.data.orders) {
        // Обрабатываем фото для корректного отображения
        const processedResults = result.data.orders.map(order => ({
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
          email: order.email
        }));
        setSearchResults(processedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Ошибка поиска:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim().length < 3) {
      alert("Введите минимум 3 символа для поиска");
      return;
    }

    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.id) {
      // Открываем модальное окно через глобальное событие
      window.dispatchEvent(new CustomEvent('openAnimalModal', { 
        detail: { animalId: suggestion.id } 
      }));
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    if (dateString.includes('-')) {
      const [day, month, year] = dateString.split('-');
      return `${day}.${month}.${year}`;
    }
    return dateString;
  };

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4">
                {searchQuery ? (
                  <>Результаты поиска по запросу: <span className="text-primary">"{searchQuery}"</span></>
                ) : (
                  'Поиск объявлений'
                )}
              </h2>
              
              {/* Поиск с подсказками */}
              <div className="position-relative mb-4" ref={searchRef}>
                <form className="d-flex" role="search" onSubmit={handleSearchSubmit}>
                  <input 
                    className="form-control form-control-lg me-2" 
                    type="search" 
                    placeholder="Поиск по объявлениям..." 
                    aria-label="Поиск"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length >= 3 && setShowSuggestions(true)}
                  />
                  <button className="btn btn-primary btn-lg" type="submit">
                    Поиск
                  </button>
                </form>
                
                {/* Подсказки */}
                {showSuggestions && searchQuery.length >= 3 && (
                  <div className="suggestions-dropdown position-absolute top-100 start-0 end-0 mt-1 bg-white border rounded shadow-lg z-3">
                    <div className="p-2 border-bottom">
                      <small className="text-muted">
                        {isLoadingSuggestions ? "Идет поиск..." : `Найдено: ${suggestions.length}`}
                      </small>
                    </div>
                    
                    {suggestions.length > 0 ? (
                      <ul className="list-unstyled mb-0" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {suggestions.map((suggestion) => (
                          <li 
                            key={suggestion.id} 
                            className="suggestion-item p-2 border-bottom hover-bg-light cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center">
                              {suggestion.photos || suggestion.photo ? (
                                <img 
                                  src={suggestion.photos || suggestion.photo}
                                  alt={suggestion.kind}
                                  className="rounded me-2"
                                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%236c757d' text-anchor='middle' dy='.3em'%3EНет фото%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              ) : (
                                <div className="rounded me-2 d-flex align-items-center justify-content-center"
                                  style={{ width: "40px", height: "40px", backgroundColor: "#f8f9fa" }}>
                                  <i className="bi bi-image text-muted"></i>
                                </div>
                              )}
                              
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between">
                                  <strong>{suggestion.kind || "Без названия"}</strong>
                                  <small className="text-muted">{suggestion.district || "Район не указан"}</small>
                                </div>
                                <div className="text-truncate" style={{ maxWidth: "300px" }}>
                                  {suggestion.description || "Нет описания"}
                                </div>
                                <div className="d-flex justify-content-between mt-1">
                                  <small>Клеймо: {suggestion.mark || "Нет"}</small>
                                  <small>{suggestion.date || "Дата не указана"}</small>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      !isLoadingSuggestions && (
                        <div className="p-3 text-center text-muted">
                          По запросу "{searchQuery}" ничего не найдено
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              
              <div className="search-stats mb-3">
                {searchQuery.length >= 3 && (
                  <p className="lead">
                    {searchQuery.length >= 3 
                      ? `Найдено объявлений: ${loading ? '...' : searchResults.length}` 
                      : "Введите минимум 3 символа для поиска"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="col-12 text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Идет поиск объявлений...</p>
        </div>
      ) : searchQuery.length < 3 ? (
        <div className="col-12 text-center py-5">
          <div className="alert alert-info">
            <i className="bi bi-search me-2"></i>
            Для поиска введите минимум 3 символа в поле поиска вверху страницы
          </div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-search display-1 text-muted mb-4"></i>
              <h4>По запросу "{searchQuery}" ничего не найдено</h4>
              <p className="text-muted mt-3">Попробуйте изменить поисковый запрос</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="col-12">
          <div className="row g-4">
            {searchResults.map((animal) => (
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
                    Найдено <strong>{searchResults.length}</strong> объявлений по запросу "{searchQuery}"
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="alert alert-light">
                  <h5 className="alert-heading">
                    <i className="bi bi-lightbulb me-2"></i>
                    Советы по поиску
                  </h5>
                  <p className="mb-0">
                    Используйте более конкретные ключевые слова для точного поиска
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;