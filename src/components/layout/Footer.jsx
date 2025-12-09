import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 bg-dark text-white mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p>© 2025 WebPets. Все права защищены.</p>
            <p className="small text-muted">
              Проект создан для помощи бездомным животным найти новый дом
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="mb-2">
              <a href="#" className="text-white me-3">Политика конфиденциальности</a>
              <a href="#" className="text-white">Условия использования</a>
            </div>
            <div>
              <a href="mailto:helpAnimal@mail.ru" className="text-white me-3">
                <i className="bi bi-envelope me-1"></i>
                helpAnimal@mail.ru
              </a>
              <a href="tel:+793156223132" className="text-white">
                <i className="bi bi-telephone me-1"></i>
                +7 (931) 562-231-32
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;