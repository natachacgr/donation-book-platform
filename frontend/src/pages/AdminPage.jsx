import React, { useState, useEffect } from "react";
import { Search, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ToggleSwitch from "../components/ToggleSwitch";
import AdminBooksTable from "../components/AdminBooksTable";
import ReportsTable from "../components/ReportsTable";
import BookModal from "../components/BookModal";
import ReportModal from "../components/ReportModal";

// Importar as funções da API
import {
  getLivros,
  criarLivro,
  atualizarLivro,
  deletarLivro,
  listarDoacoes,
  excluirDoacao,
} from "../services/api";

const AdminPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("livros");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Modais
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  // Dados dos livros e relatórios
  const [livros, setLivros] = useState([]);
  const [relatorios, setRelatorios] = useState([]);

  // Carregar dados quando o componente monta ou quando a aba muda
  useEffect(() => {
    if (activeTab === "livros") {
      loadLivros();
    } else {
      loadRelatorios();
    }
  }, [activeTab]);

  // Função para carregar livros do backend
  const loadLivros = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getLivros(); // Pegue a resposta completa
      setLivros(response.livros); // <--- CORREÇÃO AQUI: Acesse 'livros' da resposta
    } catch (err) {
      setError("Erro ao carregar livros: " + err.message);
      console.error("Erro ao carregar livros:", err);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar relatórios do backend
  const loadRelatorios = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listarDoacoes(); // Pegue a resposta completa
      setRelatorios(response.doacoes); // <--- CORREÇÃO AQUI: Acesse 'doacoes' da resposta (se o backend retornar assim)
      // Se o backend retornar um array diretamente, mantenha setRelatorios(response).
      // Baseado em doacoes.py, deve ser 'doacoes'.
    } catch (err) {
      setError("Erro ao carregar relatórios: " + err.message);
      console.error("Erro ao carregar relatórios:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtros de busca
  const filteredLivros = livros.filter(
    (livro) =>
      livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livro.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRelatorios = relatorios.filter(
    (relatorio) =>
      relatorio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relatorio.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relatorio.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers dos livros
  const handleAddBook = () => {
    setEditingBook(null);
    setBookModalOpen(true);
  };

  const handleEditBook = (livro) => {
    setEditingBook(livro);
    setBookModalOpen(true);
  };

  const handleSaveBook = async (formData) => {
    try {
      setLoading(true);
      setError("");

      if (editingBook) {
        await atualizarLivro(editingBook.id, formData);
      } else {
        await criarLivro(formData);
      }

      await loadLivros(); // Recarregar a lista de livros
      setEditingBook(null);
      setBookModalOpen(false);
    } catch (err) {
      setError("Erro ao salvar livro: " + err.message);
      console.error("Erro ao salvar livro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este livro?")) {
      try {
        setLoading(true);
        setError("");
        await deletarLivro(id);
        await loadLivros(); // Recarregar lista
      } catch (err) {
        setError("Erro ao excluir livro: " + err.message);
        console.error("Erro ao excluir livro:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers dos relatórios
  const handleEditReport = (relatorio) => {
    setEditingReport(relatorio);
    setReportModalOpen(true);
  };

  const handleSaveReport = async (formData) => {
    try {
      setLoading(true);
      setError("");

      // Aqui você pode implementar uma função de atualização de relatório
      // Por enquanto, vamos apenas atualizar localmente
      setRelatorios((prev) =>
        prev.map((r) => (r.id === editingReport.id ? { ...r, ...formData } : r))
      );

      setEditingReport(null);
      setReportModalOpen(false);
    } catch (err) {
      setError("Erro ao salvar relatório: " + err.message);
      console.error("Erro ao salvar relatório:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este relatório?")) {
      try {
        setLoading(true);
        setError("");
        await excluirDoacao(id);
        await loadRelatorios(); // Recarregar lista
      } catch (err) {
        setError("Erro ao excluir relatório: " + err.message);
        console.error("Erro ao excluir relatório:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#9B033E] rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Painel Administrativo
              </h1>
            </div>
            <button
              onClick={handleLogoutClick}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Exibir erro se houver */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Toggle Switch */}
        <div className="flex justify-center mb-8">
          <ToggleSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Campo de Busca */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Buscar ${
                activeTab === "livros" ? "livros..." : "relatórios..."
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B033E] focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div
            className={`p-6 bg-gradient-to-r ${
              activeTab === "livros"
                ? "from-[#9B033E] to-pink-600"
                : "from-blue-600 to-purple-600"
            }`}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              {activeTab === "livros"
                ? "Gerenciar Livros"
                : "Relatórios de Doações"}
            </h2>
            <p className="text-white opacity-90">
              {loading
                ? "Carregando..."
                : activeTab === "livros"
                ? `${filteredLivros.length} livros encontrados`
                : `${filteredRelatorios.length} registros encontrados`}
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B033E] mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando...</p>
              </div>
            ) : (
              <>
                {activeTab === "livros" ? (
                  <AdminBooksTable
                    livros={filteredLivros}
                    onEdit={handleEditBook}
                    onDelete={handleDeleteBook}
                    onAdd={handleAddBook}
                  />
                ) : (
                  <ReportsTable
                    relatorios={filteredRelatorios}
                    onEdit={handleEditReport}
                    onDelete={handleDeleteReport}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <BookModal
        isOpen={bookModalOpen}
        onClose={() => {
          setBookModalOpen(false);
          setEditingBook(null);
        }}
        book={editingBook}
        onSave={handleSaveBook}
        isEditing={!!editingBook}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setEditingReport(null);
        }}
        report={editingReport}
        onSave={handleSaveReport}
      />
    </div>
  );
};

export default AdminPage;
