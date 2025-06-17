import React from "react";
import { Book, BarChart3 } from "lucide-react";

const ToggleSwitch = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-gray-100 p-1 rounded-xl inline-flex mb-8">
      <button
        onClick={() => setActiveTab("livros")}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === "livros"
            ? "bg-white text-[#9B033E] shadow-md"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <Book className="w-5 h-5 inline-block mr-2" />
        Livros
      </button>
      <button
        onClick={() => setActiveTab("relatorio")}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === "relatorio"
            ? "bg-white text-[#9B033E] shadow-md"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <BarChart3 className="w-5 h-5 inline-block mr-2" />
        Relatório
      </button>
    </div>
  );
};

export default ToggleSwitch;
