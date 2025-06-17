import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const BookModal = ({ isOpen, onClose, book, onSave, isEditing }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    quantidade: 0,
  });

  // Atualizar formData sempre que o modal abrir ou o livro mudar
  useEffect(() => {
    if (isOpen) {
      if (book && isEditing) {
        // Modo edição: preencher com dados do livro
        setFormData({
          titulo: book.titulo || "",
          autor: book.autor || "",
          quantidade: book.quantidade || 0,
        });
      } else {
        // Modo criação: limpar formulário
        setFormData({
          titulo: "",
          autor: "",
          quantidade: 0,
        });
      }
    }
  }, [isOpen, book, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.titulo.trim() || !formData.autor.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (formData.quantidade < 0) {
      alert("A quantidade não pode ser negativa.");
      return;
    }

    // Chamar função de salvar
    onSave(formData);
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setFormData({
      titulo: "",
      autor: "",
      quantidade: 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEditing ? "Editar Livro" : "Adicionar Livro"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B033E] focus:border-transparent"
                placeholder="Digite o título do livro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autor *
              </label>
              <input
                type="text"
                value={formData.autor}
                onChange={(e) => handleInputChange("autor", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B033E] focus:border-transparent"
                placeholder="Digite o nome do autor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                value={formData.quantidade}
                onChange={(e) =>
                  handleInputChange("quantidade", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B033E] focus:border-transparent"
                placeholder="Quantidade de exemplares"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#9B033E] text-white py-2 rounded-lg hover:bg-[#7A0230] transition-colors"
            >
              {isEditing ? "Salvar Alterações" : "Adicionar Livro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;
