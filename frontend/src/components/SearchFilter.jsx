import { Search } from "lucide-react";

const SearchFilter = ({ searchTerm, setSearchTerm, resultsCount }) => {
  return (
    <div className="mb-8">
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9B033E] focus:border-transparent outline-none transition-all"
          />
        </div>
        {searchTerm && (
          <p className="text-center text-sm text-gray-800 mt-2">
            {resultsCount} resultado{resultsCount !== 1 ? "s" : ""} encontrado
            {resultsCount !== 1 ? "s" : ""} para "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
