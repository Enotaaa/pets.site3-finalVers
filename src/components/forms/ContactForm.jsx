import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    recipient: 'helpAnimal@mail.ru',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      alert('Пожалуйста, введите сообщение');
      return;
    }
    
    alert(`Сообщение отправлено на ${formData.recipient}`);
    setFormData({ ...formData, message: '' });
  };

  return (
    <div className="modal fade" id="contacts" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Контакты</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Получатель:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.recipient}
                  onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Сообщение:</label>
                <textarea 
                  className="form-control" 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="4"
                  required
                />
              </div>
              
              <div className="mb-4">
                <h6>Вы также можете позвонить нам:</h6>
                <ul className="list-group">
                  <li className="list-group-item">+7 (931) 562-231-32</li>
                  <li className="list-group-item">+7 (911) 123-45-67</li>
                </ul>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Закрыть
                </button>
                <button type="submit" className="btn btn-primary">
                  Отправить сообщение
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;