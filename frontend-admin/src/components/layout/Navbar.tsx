import React from 'react';
import { Menu } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

const Navbar: React.FC = () => {
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
            <UserButton afterSignOutUrl="/sign-in" />
        </div>
    </div>
  );
};

export default Navbar; 