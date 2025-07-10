import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-4">
        <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                <Menu />
            </label>
        </div>
        <div className="flex-1">
            <a className="btn btn-ghost text-xl">Zemon Admin</a>
        </div>
        <div className="flex-none">
            <button 
              onClick={handleLogout}
              className="btn btn-ghost gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
        </div>
    </div>
  );
};

export default Navbar; 