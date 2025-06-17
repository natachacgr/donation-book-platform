// components/Modal.jsx
import React, { useState } from "react";
import { X, Check, Book, Dices } from "lucide-react";
import { doarLivro, doarJogo, atualizarQuantidadeLivro } from "../services/api";

const Modal = ({
  selectedItem,
  currentPage,
  formData,
  setFormData,
  closeModal, // closeModal agora recebe um flag de sucesso
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // <--- ESTE ESTADO É FUNDAMENTAL

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Esta função é o ponto de saída do modal
  const handleClose = () => {
    // isSuccess reflete o resultado da ÚLTIMA TENTATIVA de doação
    closeModal(isSuccess); // <--- PASSA O isSuccess PARA O App.jsx
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage("");
    setIsSuccess(false); // Resetar sucesso antes de cada nova tentativa de submissão

    try {
      const { nome, email, lgpdConsent } = formData;

      if (!lgpdConsent) {
        throw new Error("Você deve aceitar a Política de Privacidade.");
      }

      let response; // Variável para armazenar a resposta da API de doação
      if (currentPage === "livros") {
        if (
          !selectedItem ||
          !selectedItem.titulo ||
          !selectedItem.autor ||
          selectedItem.quantidade === undefined ||
          selectedItem.id === undefined
        ) {
          throw new Error("Dados do livro selecionado inválidos.");
        }
        if (selectedItem.quantidade <= 0) {
          throw new Error("Este livro está esgotado.");
        }

        response = await doarLivro({
          // Armazena a resposta aqui
          nome,
          email,
          titulo: selectedItem.titulo,
          autor: selectedItem.autor,
          livro_id: selectedItem.id,
          lgpdConsent: lgpdConsent,
        });

        // Tentar atualizar a quantidade APÓS o sucesso da doação principal
        if (response.success) {
          try {
            const novaQuantidade = selectedItem.quantidade - 1;
            await atualizarQuantidadeLivro(selectedItem.id, novaQuantidade);
          } catch (updateError) {
            console.error(
              "Erro ao tentar atualizar quantidade (pode ser CORS ou outro):",
              updateError
            );
            // Não marcamos como falha geral porque a doação em si foi registrada
          }
        }
      } else {
        // Se for doação de jogo
        response = await doarJogo({
          // Armazena a resposta aqui
          nome,
          email,
          lgpdConsent: lgpdConsent,
        });
      }

      // Se a resposta geral da API de doação indicou sucesso
      if (response && response.success) {
        setFeedbackMessage(
          response.message || "Doação registrada com sucesso!"
        );
        setIsSuccess(true); // <--- MARCA O SUCESSO AQUI
        // Limpar o formulário somente após o sucesso
        setFormData({
          nome: "",
          email: "",
          lgpdConsent: false,
        });
      } else {
        // Se response.success for false ou response for null/undefined (o que não deve acontecer com throws)
        throw new Error(response?.message || "Falha ao registrar doação.");
      }
    } catch (error) {
      console.error("Erro na doação (geral do formulário):", error);
      setFeedbackMessage(
        `Erro: ${error.message || "Ocorreu um erro desconhecido."}`
      );
      setIsSuccess(false); // <--- GARANTE QUE O SUCESSO É FALSO EM CASO DE ERRO
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              {currentPage === "livros" ? (
                <Book className="w-6 h-6 text-[#9B033E]" />
              ) : (
                <Dices className="w-6 h-6 text-[#5ed0a9]" />
              )}
              <h3 className="text-xl font-bold text-gray-800">
                {currentPage === "livros"
                  ? "Confirmar Escolha do Livro"
                  : "Doar Jogo"}
              </h3>
            </div>
            <button
              onClick={handleClose} // <--- CHAMAR handleClose
              disabled={isSubmitting}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {feedbackMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                isSuccess
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {feedbackMessage}
            </div>
          )}

          {selectedItem && currentPage === "livros" && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-1">
                {selectedItem.titulo}
              </h4>
              <p className="text-gray-600 text-sm">por {selectedItem.autor}</p>
              {selectedItem.quantidade !== undefined && (
                <p className="text-gray-500 text-xs mt-1">
                  Quantidade restante: {selectedItem.quantidade}
                </p>
              )}
            </div>
          )}

          {!isSuccess ? ( // Exibe o formulário SE NÃO HOUVE SUCESSO AINDA
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B033E] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B033E] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="lgpd"
                  required
                  disabled={isSubmitting}
                  checked={formData.lgpdConsent}
                  onChange={(e) =>
                    handleInputChange("lgpdConsent", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 text-[#9B033E] focus:ring-[#9B033E] border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="lgpd"
                  className="text-sm text-gray-700 leading-tight"
                >
                  Autorizo o uso dos meus dados pessoais conforme a LGPD para
                  fins de controle de doações e comunicação relacionada a este
                  projeto.
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose} // <--- CHAMAR handleClose
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#9B033E] text-white rounded-lg hover:bg-[#7A0230] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Exibe o botão "Fechar" SE JÁ HOUVE SUCESSO
            <div className="text-center mt-6">
              <button
                onClick={handleClose}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
