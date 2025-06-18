// App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import BookPage from "./pages/BookPage";
import GamePage from "./pages/GamePage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import Modal from "./components/Modal";
import { loginAdmin, logoutAdmin, initializeAuth } from "./services/api";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    lgpdConsent: false,
  });

  // Callback que será chamado ao fechar o modal
  const [modalCloseCallback, setModalCloseCallback] = useState(null);

  useEffect(() => {
    initializeAuth((loggedIn) => setIsAdminLoggedIn(loggedIn));
  }, []);

  // openModal aceita um callback que será chamado ao fechar o modal
  const openModal = (item = null, onCloseCallback = null) => {
    setSelectedItem(item);
    // Corrige o armazenamento do callback
    setModalCloseCallback(() => onCloseCallback);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);

    // SEMPRE chama o callback se ele existir
    if (modalCloseCallback) {
      modalCloseCallback();
    }

    setModalCloseCallback(null);
    setFormData({ nome: "", email: "", lgpdConsent: false });
  };

  const handleAdminLogin = async (username, password) => {
    try {
      const success = await loginAdmin(username, password);
      if (success) {
        setIsAdminLoggedIn(true);
        return true;
      } else {
        alert("Credenciais inválidas!");
        return false;
      }
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
      return false;
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdminLoggedIn(false);
  };

  const PrivateRoute = ({ children }) => {
    return isAdminLoggedIn ? children : <Navigate to="/admin/login" replace />;
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/livros" element={<BookPage openModal={openModal} />} />
          <Route path="/jogos" element={<GamePage openModal={openModal} />} />
          <Route
            path="/login"
            element={<LoginPage onLogin={handleAdminLogin} />}
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPage onLogout={handleAdminLogout} />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {showModal && (
          <Modal
            selectedItem={selectedItem}
            currentPage={
              selectedItem &&
              typeof selectedItem === "object" &&
              selectedItem.titulo
                ? "livros"
                : "jogos"
            }
            formData={formData}
            setFormData={setFormData}
            closeModal={closeModal}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
