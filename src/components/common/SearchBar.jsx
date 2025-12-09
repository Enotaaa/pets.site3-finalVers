import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSuggestionClick }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Закрытие подсказок при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://pets.xn--80ahdri7a.site/api/search?query=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSuggestions(data.data?.orders?.slice(0, 5) || []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce для запросов
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (animalId) => {
    if (onSuggestionClick) {
      onSuggestionClick(animalId);
    }
    setShowSuggestions(false);
    setQuery('');
  };

  return (
    <div className="position-relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="d-flex">
        <div className="input-group">
          <input
            type="search"
            className="form-control"
            placeholder="Поиск животных..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          />
          <button 
            type="submit" 
            className="btn btn-outline-light"
            disabled={query.trim().length < 3}
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
      </form>

      {showSuggestions && query.length >= 3 && (
        <div className="dropdown-menu show w-100 mt-1">
          {isLoading ? (
            <div className="dropdown-item text-muted">Загрузка...</div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="dropdown-header small text-muted">
                Найдено: {suggestions.length}
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => handleSuggestionClick(suggestion.id)}
                >
                  {suggestion.photos ? (
                    <img
                      src={`https://pets.xn--80ahdri7a.site${suggestion.photos}`}
                      alt={suggestion.kind}
                      className="rounded me-2"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="rounded me-2 bg-light d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-image text-muted"></i>
                    </div>
                  )}
                  <div className="text-truncate">
                    <div className="fw-medium">{suggestion.kind}</div>
                    <small className="text-muted">{suggestion.district}</small>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="dropdown-item text-muted">Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;