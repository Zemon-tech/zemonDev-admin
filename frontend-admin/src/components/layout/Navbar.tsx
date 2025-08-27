import React from 'react';
import { Menu } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { useUIChrome } from './UIChromeContext';

const Navbar: React.FC = () => {
  const { navbarTitle, navbarActions, topbar } = useUIChrome();

  return (
    <div className="sticky top-0 z-50 shadow-md">
      <div className="navbar bg-base-100 px-4">
        <div className="flex-none lg:hidden">
          <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
            <Menu />
          </label>
        </div>
        <div className="flex-1">
          {navbarTitle || <a className="btn btn-ghost text-xl">Zemon Admin</a>}
        </div>
        <div className="flex items-center gap-2">
          {navbarActions}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
      {topbar && (
        <div className="bg-base-100 border-t border-base-200">
          {topbar}
        </div>
      )}
    </div>
  );
};

export default Navbar; 