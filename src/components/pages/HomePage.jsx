import React from 'react';
import Slider from '../layout/Slider';
import AnimalList from '../animals/AnimalList';
import NewsletterForm from '../forms/NewsletterForm';

const HomePage = () => {
  return (
    <>
      <Slider />
      
      <div className="container mt-5">
        <div className="text-center mb-5">
          <h1>Найди своего питомца</h1>
          <p className="lead text-muted">
            Помогите животным найти новый дом или найдите друга для себя
          </p>
        </div>
        
        <h2 className="mb-4">Последние найденные животные</h2>
        <AnimalList limit={3} />
        
        <div className="row mt-5 mb-5">
          <div className="col-12">
            <div className="jumbotron jumbotron-fluid text-center rounded bg-dark text-white p-5">
              <div className="container">
                <h2 className="display-5 mb-3">Помогите животным найти дом!</h2>
                <p className="lead mb-4">
                  Если вы нашли животное или готовы приютить одного из них, 
                  заполните форму находки.
                </p>
                <button 
                  className="btn btn-light btn-lg"
                  data-bs-toggle="modal"
                  data-bs-target="#newPost"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Сообщить о находке
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <NewsletterForm />
    </>
  );
};

export default HomePage;