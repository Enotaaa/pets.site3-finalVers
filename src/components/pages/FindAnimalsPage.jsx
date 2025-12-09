import React, { useState, useEffect } from 'react';
import AnimalList from '../animals/AnimalList';
import AnimalFilters from '../animals/AnimalFilters';
import FoundAnimalForm from '../forms/FoundAnimalForm';
import ContactForm from '../forms/ContactForm';
import ProfileModal from '../profile/ProfileModal';
import AuthModal from '../auth/AuthModal';
import { useNavigate } from 'react-router-dom';

const FindAnimalsPage = () => {
  const [filters, setFilters] = useState({
    animalType: 'all',
    dateRange: 'all'
  });

  const navigate = useNavigate();

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.querySelector('input[type="text"]');
    if (searchInput && searchInput.value.trim().length >= 3) {
      navigate(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
    }
  };

  return (
    <>
      <div className="container mt-5">
        <div className="text-center mb-5">
          <h1>Найденные животные</h1>
          <p className="lead text-muted">
            Найдите питомца, который ищет дом, или помогите найти хозяина для найденного животного
          </p>
          
          {/* Поисковая строка */}
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <form onSubmit={handleSearch}>
                <div className="input-group mb-4 shadow-sm">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Найти животное по описанию, породе, району..."
                    minLength={3}
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
        
        <AnimalFilters filters={filters} onFilterChange={handleFilterChange} />
        
        <h2 className="mb-4">Доступные животные</h2>
        <AnimalList filters={filters} />
        
        <div className="row mt-5 mb-5">
          <div className="col-md-8 mx-auto">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h5 className="card-title">Не нашли подходящее животное?</h5>
                <p className="card-text">
                  Возможно, вам стоит заглянуть позже или разместить объявление о находке, 
                  если вы нашли животное самостоятельно.
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
      
      {/* Модальные окна */}
      <FoundAnimalForm />
      <ContactForm />
      <ProfileModal />
      <AuthModal />
    </>
  );
};

export default FindAnimalsPage;