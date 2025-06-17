import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ReportModal = ({ isOpen, onClose, report, onSave }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    tipo: "livro",
    item: "",
  });

  // Atualizar formData sempre que o modal abrir ou o relatório mudar
  useEffect(() => {
    if (isOpen && report) {
      setFormData({
        nome: report.nome || "",
        email: report.email || "",
        tipo: report.tipo || "livro",
        item: report.item || "",
      });
    } else if (isOpen && !report) {
      // Limpar formulário se não há relatório para editar
      setFormData({
        nome: "",
        email: "",
        tipo: "livro",
        item: "",
      });
    }
  }, [isOpen, report]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    if (
      !formData.nome.trim() ||
      !formData.email.trim() ||
      !formData.item.trim()
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Por favor, insira um email válido.");
      return;
    }

    // Chamar função de salvar
    onSave(formData);
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setFormData({
      nome: "",
      email: "",
      tipo: "livro",
      item: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {report ? "Editar Relatório" : "Novo Relatório"}
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
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B033E] focus:border-transparent outline-none"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B033E] focus:border-transparent outline-none"
                placeholder="Digite o email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B033E] focus:border-transparent outline-none"
                required
              >
                <option value="livro">Livro</option>
                <option value="jogo">Jogo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item *
              </label>
              <input
                type="text"
                value={formData.item}
                onChange={(e) => handleInputChange("item", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B033E] focus:border-transparent outline-none"
                placeholder={
                  formData.tipo === "livro"
                    ? "Ex: O Alquimista - Paulo Coelho"
                    : "Ex: Xadrez"
                }
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-6">
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
              {report ? "Salvar Alterações" : "Criar Relatório"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
