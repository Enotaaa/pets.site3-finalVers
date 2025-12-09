import React from 'react';

const AnimalFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="row mb-4">
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">
              <i className="bi bi-funnel me-2"></i>
              Фильтр по типу
            </h6>
            <select 
              className="form-select"
              value={filters.animalType || 'all'}
              onChange={(e) => onFilterChange('animalType', e.target.value)}
            >
              <option value="all">Все животные</option>
              <option value="cat">Кошки</option>
              <option value="dog">Собаки</option>
              <option value="rabbit">Кролики</option>
              <option value="other">Другие</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">
              <i className="bi bi-calendar me-2"></i>
              Фильтр по дате
            </h6>
            <select 
              className="form-select"
              value={filters.dateRange || 'all'}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
            >
              <option value="all">Все даты</option>
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
              <option value="older">Старые (более месяца)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="col-lg-6">
        <div className="card bg-light">
          <div className="card-body">
            <h6 className="card-title">
              <i className="bi bi-info-circle me-2"></i>
              Помощь животным
            </h6>
            <p className="card-text mb-0">
              Если вы нашли животное или готовы приютить питомца, 
              воспользуйтесь формой "Сообщить о находке".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalFilters;