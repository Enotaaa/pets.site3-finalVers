import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingOrder, setEditingOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (user?.token) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://pets.xn--80ahdri7a.site/api/users/orders', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data?.orders || []);
      } else if (response.status === 204) {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge bg-success';
      case 'wasFound': return 'badge bg-primary';
      case 'onModeration': return 'badge bg-warning';
      case 'archive': return 'badge bg-secondary';
      default: return 'badge bg-light text-dark';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активное';
      case 'wasFound': return 'Хозяин найден';
      case 'onModeration': return 'На модерации';
      case 'archive': return 'В архиве';
      default: return status;
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!user?.token) return;
    
    try {
      const response = await fetch(`https://pets.xn--80ahdri7a.site/api/users/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Объявление успешно удалено' });
        fetchUserOrders();
      } else {
        setMessage({ type: 'danger', text: 'Ошибка при удалении объявления' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Ошибка сети' });
    }
    setDeleteConfirm(null);
  };

  const handleEditOrder = async (orderId, formData) => {
    if (!user?.token) return;
    
    try {
      const response = await fetch(`https://pets.xn--80ahdri7a.site/api/pets/${orderId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Объявление успешно обновлено' });
        fetchUserOrders();
        setEditingOrder(null);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'danger', text: errorData.message || 'Ошибка при обновлении' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Ошибка сети' });
    }
  };

  return (
    <div>
      <h5>Мои объявления</h5>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}
      
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-2">Загрузка объявлений...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-4">
          <p className="text-muted">У вас еще нет объявлений</p>
          <button 
            className="btn btn-sm btn-outline-dark" 
            data-bs-toggle="modal" 
            data-bs-target="#newPost"
            data-bs-dismiss="modal"
          >
            Создать объявление
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="card mb-3">
              {order.photos && (
                <img 
                  src={`https://pets.xn--80ahdri7a.site${order.photos}`}
                  className="card-img-top"
                  alt={order.kind}
                  style={{ height: '150px', objectFit: 'cover' }}
                />
              )}
              
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h6 className="card-title mb-1">{order.kind || 'Животное'}</h6>
                  <span className={getStatusBadgeClass(order.status)}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                <p className="card-text small mb-1">
                  {order.description?.substring(0, 100)}
                  {order.description?.length > 100 ? '...' : ''}
                </p>
                
                <div className="row small text-muted mt-2">
                  <div className="col-6">
                    <strong>Метка:</strong> {order.mark || 'Не указана'}
                  </div>
                  <div className="col-6">
                    <strong>Район:</strong> {order.district || 'Не указан'}
                  </div>
                  <div className="col-12 mt-1">
                    <strong>Дата:</strong> {order.date || 'Не указана'}
                  </div>
                </div>
                
                {(order.status === 'active' || order.status === 'onModeration') && (
                  <div className="mt-3 d-flex gap-2">
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setEditingOrder(order)}
                    >
                      Редактировать
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setDeleteConfirm(order)}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="text-center mt-3">
            <button 
              className="btn btn-sm btn-outline-dark" 
              data-bs-toggle="modal" 
              data-bs-target="#newPost"
              data-bs-dismiss="modal"
            >
              Создать новое объявление
            </button>
          </div>
        </div>
      )}
      
      {/* Модальное окно удаления */}
      {deleteConfirm && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Подтверждение удаления</h5>
              </div>
              <div className="modal-body">
                <p>Вы уверены, что хотите удалить объявление "{deleteConfirm.kind}"?</p>
                <p className="text-muted small">Это действие нельзя отменить.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteConfirm(null)}
                >
                  Отмена
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteOrder(deleteConfirm.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно редактирования */}
      {editingOrder && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Редактирование объявления</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setEditingOrder(null)}
                />
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleEditOrder(editingOrder.id, formData);
              }}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Тип животного:</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="kind"
                      defaultValue={editingOrder.kind}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Описание:</label>
                    <textarea 
                      className="form-control" 
                      name="description"
                      rows="3"
                      defaultValue={editingOrder.description}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Метка:</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="mark"
                      defaultValue={editingOrder.mark}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditingOrder(null)}
                  >
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;