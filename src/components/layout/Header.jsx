import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Header = ({ onAnimalClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  
  const debounceTimerRef = useRef(null);

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

    setIsLoading(true);
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
      setIsLoading(false);
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
    setSearchQuery("");
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.id && onAnimalClick) {
      onAnimalClick(suggestion.id);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    alert("Вы вышли из аккаунта");
  };

  // Проверяем активную страницу
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <i className="bi bi-heart-fill me-2"></i>WebPets
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Главная
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/find-animals" 
                className={`nav-link ${isActive('/find-animals') ? 'active' : ''}`}
              >
                Найти питомца
              </Link>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link" 
                data-bs-toggle="modal" 
                data-bs-target="#newPost"
              >
                Сообщить о находке
              </button>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            {/* Поиск с подсказками */}
            <div className="position-relative me-3" ref={searchRef}>
              <form className="d-flex" onSubmit={handleSearchSubmit}>
                <input 
                  className="form-control me-2" 
                  type="search" 
                  placeholder="Поиск..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length >= 3 && setShowSuggestions(true)}
                />
                <button className="btn btn-outline-light" type="submit">
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    "Поиск"
                  )}
                </button>
              </form>
              
              {/* Подсказки */}
              {showSuggestions && searchQuery.length >= 3 && (
                <div className="suggestions-dropdown position-absolute top-100 start-0 end-0 mt-1 bg-white border rounded shadow-lg z-3">
                  <div className="p-2 border-bottom">
                    <small className="text-muted">
                      {isLoading ? "Идет поиск..." : `Найдено: ${suggestions.length}`}
                    </small>
                  </div>
                  
                  {suggestions.length > 0 ? (
                    <ul className="list-unstyled mb-0" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {suggestions.map((suggestion) => (
                        <li 
                          key={suggestion.id} 
                          className="suggestion-item p-2 border-bottom hover-bg-light"
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
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    !isLoading && (
                      <div className="p-3 text-center text-muted">
                        По запросу "{searchQuery}" ничего не найдено
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            
            {/* Контакты */}
            <button 
              className="btn btn-light me-2" 
              data-bs-toggle="modal" 
              data-bs-target="#contacts"
            >
              Контакты
            </button>
            
            {/* Авторизация */}
            <button 
              className="btn btn-light me-2" 
              data-bs-toggle="modal" 
              data-bs-target="#authModal"
              onClick={() => {
                if (user) {
                  handleLogout();
                }
              }}
            >
              {user ? "Выйти" : "Войти"}
            </button>
            
            {/* Профиль */}
            <button 
              className="btn btn-light" 
              data-bs-toggle="modal" 
              data-bs-target="#profileModal"
            >
              {user ? user.name : "Профиль"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;