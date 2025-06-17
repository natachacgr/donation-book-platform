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

  // Novo estado para armazenar a função de callback que será chamada ao fechar o modal,
  // mas SOMENTE se a operação interna do modal (doação) foi um sucesso.
  const [modalCloseCallback, setModalCloseCallback] = useState(null);

  useEffect(() => {
    initializeAuth((loggedIn) => setIsAdminLoggedIn(loggedIn));
  }, []);

  // openModal agora aceita um callback que será chamado ao fechar o modal
  // (Este callback será passado para o Modal e ele o chamará quando fechar,
  // mas o Modal decidirá SE deve chamar, baseado no sucesso da operação interna).
  const openModal = (item = null, onCloseCallback = null) => {
    setSelectedItem(item);
    setModalCloseCallback(onCloseCallback); // Armazena o callback para ser usado quando o modal for fechado
    setShowModal(true);
  };

  const closeModal = (didSucceed = false) => {
    // closeModal AGORA RECEBE UM FLAG DE SUCESSO
    setShowModal(false);
    setSelectedItem(null);
    // Chame o callback APENAS SE A OPERAÇÃO INTERNA FOI SUCESSO e o callback existe
    if (didSucceed && modalCloseCallback) {
      modalCloseCallback();
    }
    setModalCloseCallback(null); // Limpa o callback
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
        <div className="fixed bottom-4 right-4 z-40">
          <a
            href="/admin/login"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg transition-colors"
          >
            Admin Login
          </a>
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/livros" element={<BookPage openModal={openModal} />} />
          <Route path="/jogos" element={<GamePage openModal={openModal} />} />
          <Route
            path="/admin/login"
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
            // handleFormSubmit não é mais passado para o Modal
            closeModal={closeModal} // <-- MUITO IMPORTANTE: Passa o closeModal do App.jsx
          />
        )}
      </div>
    </Router>
  );
};

export default App;
