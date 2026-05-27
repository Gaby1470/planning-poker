import { Link } from 'react-router-dom';
import Logo from './assets/logo.svg?react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <Link to="/" className="flex items-center py-4">
          <Logo />
          <h1 className="text-2xl font-semibold text-gray-800 ml-2">Planning Poker</h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
