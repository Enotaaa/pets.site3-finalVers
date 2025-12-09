import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import FindAnimalsPage from './components/pages/FindAnimalsPage';
import SearchPage from './components/pages/SearchPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AuthProvider } from './components/auth/AuthContext';
import AnimalModal from './components/animals/AnimalModal';
import FoundAnimalForm from './components/forms/FoundAnimalForm';
import ContactForm from './components/forms/ContactForm';
import ProfileModal from './components/profile/ProfileModal';
import AuthModal from './components/auth/AuthModal';

// Компонент для отображения модальных окон на всех страницах
const GlobalModals = () => (
  <>
    <FoundAnimalForm />
    <ContactForm />
    <ProfileModal />
    <AuthModal />
  </>
);

// Ключевой компонент - оборачиваем каждую страницу в уникальный ключ
function AppContent() {
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const location = useLocation();

  // Слушаем глобальные события для открытия модальных окон
  useEffect(() => {
    const handleOpenAnimalModal = (event) => {
      setSelectedAnimalId(event.detail.animalId);
    };

    window.addEventListener('openAnimalModal', handleOpenAnimalModal);
    
    return () => {
      window.removeEventListener('openAnimalModal', handleOpenAnimalModal);
    };
  }, []);

  // При изменении локации скрываем модальное окно животного
  useEffect(() => {
    setSelectedAnimalId(null);
  }, [location]);

  return (
    <div className="app-container">
      <Header onAnimalClick={setSelectedAnimalId} />
      <main className="main-content">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage key="home" />} />
          <Route path="/find-animals" element={<FindAnimalsPage key="find-animals" />} />
          <Route path="/search" element={<SearchPage key="search" />} />
        </Routes>
      </main>
      <Footer />
      
      {/* Глобальные модальные окна (доступны на всех страницах) */}
      <GlobalModals />
      
      {/* Модальное окно с животным */}
      {selectedAnimalId && (
        <AnimalModal 
          animalId={selectedAnimalId} 
          onClose={() => setSelectedAnimalId(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;