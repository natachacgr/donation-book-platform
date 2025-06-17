import React from "react";
import Header from "../components/Header";
import { Dices } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GamePage = ({ openModal }) => {
  const navigate = useNavigate();
  const sugestoesJogos = [
    "War",
    "Banco Imobiliário",
    "Detetive",
    "Scrabble",
    "Xadrez",
    "Dama",
    "Monopoly",
    "Risk",
    "Catan",
    "Ticket to Ride",
    "Dixit",
    "Azul",
    "Splendor",
    "King of Tokyo",
    "Pandemic",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header
        title="Jogos de Tabuleiro"
        subtitle="Sugira jogos para doação"
        showBackButton={true}
        onBack={() => navigate("/")}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-[#408c74] to-[#5ed0a9]">
            <h2 className="text-2xl font-bold text-white mb-2">
              Sugestões de Jogos
            </h2>
            <p className="text-white opacity-90">
              Escolha um jogo da lista ou sugira outro!
            </p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {sugestoesJogos.map((jogo, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Dices className="w-5 h-5 text-[#5ed0a9]" />
                    <span className="font-medium text-gray-800">{jogo}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => openModal("Jogo de Tabuleiro")}
                className="bg-[#5ed0a9] hover:bg-[#408c74] text-white px-8 py-3 rounded-xl font-medium transition-colors inline-flex items-center space-x-2"
              >
                <Dices className="w-5 h-5" />
                <span>Doar Jogo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
