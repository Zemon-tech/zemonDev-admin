import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Flame, BookOpen } from 'lucide-react';

const Sidebar: React.FC = () => {
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center p-2 rounded-lg ${isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`;

  return (
    <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content">
        <li className="text-xl font-bold p-4">Zemon Admin</li>
        <li>
            <NavLink to="/admin/dashboard" className={navLinkClass}>
                <LayoutDashboard className="mr-2" /> Dashboard
            </NavLink>
        </li>
        <li>
            <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="mr-2" /> Users
            </NavLink>
        </li>
        <li>
            <NavLink to="/admin/forge" className={navLinkClass}>
                <Flame className="mr-2" /> Forge Resources
            </NavLink>
        </li>
        <li>
            <NavLink to="/admin/crucible" className={navLinkClass}>
                <BookOpen className="mr-2" /> Crucible Problems
            </NavLink>
        </li>
    </ul>
  );
};

export default Sidebar; 