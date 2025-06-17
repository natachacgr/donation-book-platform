import { Heart, Users, Gift, Book, Dices } from "lucide-react";
import Header from "../components/Header";
import Hacktown from "../assets/hacktown.png";
import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${Hacktown})` }}
    >
      <div className="absolute inset-0 bg-white opacity-45 pointer-events-none"></div>

      <div className="relative z-10">
        <Header title="Biblioteca Municipal" subtitle="Parceria Hacktown" />

        <section className="py-14 px-6">
          <div className="container mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-6xl font-bold text-gray-800 mb-4">
                Obrigado por Fazer a Diferença!
              </h2>
              <p className="text-3xl text-gray-800 max-w-6xl mx-auto leading-relaxed ">
                Sua participação no{" "}
                <span className="font-bold text-gray-800">Hacktown</span> vai
                além da tecnologia. Juntos, estamos construindo uma comunidade
                mais forte através da{" "}
                <span className="font-bold text-gray-800">
                  doação de conhecimento
                </span>
                .
              </p>
            </div>
            <div className="bg-gradient-to-r from-[#fb3e6c] to-pink-600 rounded-3xl p-8 text-white mb-12">
              <h3 className="text-3xl font-bold mb-4">
                Escolha sua Forma de Contribuir
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  to="/livros"
                  className="bg-white text-[#9B033E] rounded-2xl p-8 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex flex-col items-center justify-center"
                >
                  <Book className="w-16 h-16 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold mb-2 text-gray-800">
                    Livros
                  </h4>
                  <p className="text-lg text-gray-800">
                    Escolha entre nossa seleção de livros
                  </p>
                </Link>

                <Link
                  to="/jogos"
                  className="bg-white text-[#408c74] rounded-2xl p-8 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex flex-col items-center justify-center"
                >
                  <Dices className="w-16 h-16 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold mb-2 text-gray-800">
                    Jogos de Tabuleiro
                  </h4>
                  <p className="text-lg text-gray-800">
                    Sugestões de jogos para doação à biblioteca
                  </p>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Comunidade
                </h3>
                <p className="text-gray-600">
                  Unindo tecnologia e educação para transformar vidas
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <Gift className="w-12 h-12 text-[#9B033E] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Generosidade
                </h3>
                <p className="text-gray-600">
                  Cada doação é uma semente de conhecimento plantada
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Impacto
                </h3>
                <p className="text-gray-600">
                  Criando oportunidades para toda a comunidade
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
