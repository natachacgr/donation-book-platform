import { Book, ArrowLeft } from "lucide-react"; // Ensure you have lucide-react installed
import logohcktown from "../assets/hacktown logo.png";
import logobiblio from "../assets/logobiblio.png"; // Assuming you have a logo for the library
const Header = ({ showBackButton = false, onBack }) => {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={onBack}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <img
                src={logobiblio}
                alt="Biblioteca Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <img
              src={logohcktown}
              alt="Hacktown Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
