import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import BookTable from "../components/BookTable";
import SearchFilter from "../components/SearchFilter";
import { getLivros } from "../services/api";
import { useNavigate } from "react-router-dom";

const BookPage = ({ openModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingBook, setUpdatingBook] = useState(null);
  const navigate = useNavigate();

  const fetchLivros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLivros();
      setLivros(response.livros);
    } catch (err) {
      setError("Erro ao buscar livros: " + err.message);
      console.error("Erro ao buscar livros:", err);
      setLivros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLivros();
  }, [fetchLivros]);

  // Esta função será chamada pelo App.jsx APENAS quando o modal for fechado COM sucesso.
  const handleModalCloseAndSuccess = useCallback(() => {
    fetchLivros(); // Recarrega os livros para atualizar a quantidade na tabela
  }, [fetchLivros]);

  const livrosOrdenados = [...livros].sort((a, b) => {
    if (a.quantidade === 0 && b.quantidade > 0) return 1;
    if (a.quantidade > 0 && b.quantidade === 0) return -1;
    return a.titulo.localeCompare(b.titulo);
  });

  const livrosFiltrados = livrosOrdenados.filter(
    (livro) =>
      livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livro.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectBook = async (livro) => {
    if (livro.quantidade <= 0) return;

    try {
      setUpdatingBook(livro.id);
      // Passa a função de callback para ser acionada ao fechar o modal com sucesso
      openModal(livro, handleModalCloseAndSuccess);
    } catch (err) {
      setError("Erro ao selecionar livro. Tente novamente.");
      console.error("Erro ao selecionar livro:", err);
    } finally {
      setUpdatingBook(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            Carregando livros...
          </h3>
          <p className="mt-4 text-gray-500">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <Header
          title="Erro ao Carregar"
          subtitle="Não foi possível carregar os livros"
          showBackButton={true}
          onBack={() => navigate("/")}
        />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-600 mb-4">{error}</h3>
            <div className="space-y-3">
              <button
                onClick={fetchLivros}
                className="bg-[#9B033E] hover:bg-[#7A0230] text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => navigate("/")}
                className="block w-full text-gray-600 hover:text-gray-800 font-medium"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header
        title="Livros Disponíveis"
        subtitle="Escolha um livro para doar"
        showBackButton={true}
        onBack={() => navigate("/")}
      />

      <div className="container mx-auto px-6 py-8">
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          resultsCount={livrosFiltrados.length}
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-[#9B033E] to-pink-600">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Lista de Livros
                </h2>
                <p className="text-white opacity-90">
                  {livrosFiltrados.length} livro
                  {livrosFiltrados.length !== 1 ? "s" : ""} encontrado
                  {livrosFiltrados.length !== 1 ? "s" : ""}
                  {searchTerm && ` para "${searchTerm}"`}
                </p>
              </div>

              <button
                onClick={fetchLivros}
                disabled={loading}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Atualizar
              </button>
            </div>
          </div>

          <BookTable
            livros={livrosFiltrados}
            onSelectBook={handleSelectBook}
            updatingBook={updatingBook}
          />
        </div>

        {livros.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-[#9B033E]">
                {livros.length}
              </div>
              <div className="text-gray-600 text-sm">Total de Livros</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {livros.filter((l) => l.quantidade > 0).length}
              </div>
              <div className="text-gray-600 text-sm">Disponíveis</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {livros.filter((l) => l.quantidade === 0).length}
              </div>
              <div className="text-gray-600 text-sm">Esgotados</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPage;
