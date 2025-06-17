import React from "react";
import { BookOpen, RefreshCw } from "lucide-react";

const BookTable = ({ livros, onSelectBook, updatingBook }) => {
  // Se não há livros para mostrar
  if (livros.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          Nenhum livro encontrado
        </h3>
        <p className="text-gray-400">Tente buscar com outros termos</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider">
              Título
            </th>
            <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider">
              Autor
            </th>
            <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider">
              Quantidade
            </th>
            <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider w-16">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {livros.map((livro) => (
            <tr
              key={livro.id}
              className={`${
                livro.quantidade === 0
                  ? "opacity-50 bg-gray-50"
                  : "hover:bg-gray-100"
              } transition-colors`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-base font-medium text-gray-900">
                  {livro.titulo}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-base text-gray-500">{livro.autor}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    livro.quantidade > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {livro.quantidade > 0
                    ? `${livro.quantidade} disponível${
                        livro.quantidade > 1 ? "eis" : ""
                      }`
                    : "Esgotado"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onSelectBook(livro)}
                  disabled={livro.quantidade === 0 || updatingBook === livro.id}
                  className={`${
                    livro.quantidade > 0
                      ? "bg-[#9B033E] hover:bg-[#7A0230] text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2`}
                >
                  {updatingBook === livro.id && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  {livro.quantidade > 0 ? "Escolher" : "Indisponível"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookTable;
