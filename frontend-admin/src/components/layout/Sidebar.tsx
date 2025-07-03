import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Flame, BookOpen } from 'lucide-react';

const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter", "dim", "nord", "sunset", "caramellatte", "abyss", "silk"
];

function ThemeSwitcher() {
  const [theme, setTheme] = React.useState(() =>
    localStorage.getItem("theme") || "corporate"
  );

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <select
      className="select select-bordered w-full"
      value={theme}
      onChange={e => setTheme(e.target.value)}
    >
      {themes.map(t => (
        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
      ))}
    </select>
  );
}

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
  { to: "/admin/forge", label: "Forge", icon: <Flame className="w-5 h-5" /> },
  { to: "/admin/crucible", label: "Crucible", icon: <BookOpen className="w-5 h-5" /> },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="flex flex-col h-full w-60 min-w-48 bg-base-200 shadow-xl border-r border-base-300">
      {/* Admin Avatar + Badge */}
      <div className="flex flex-col items-center py-6 gap-2">
        <div className="avatar">
          <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src="/vite.svg" alt="Admin Avatar" />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg text-primary-content">Zemon Admin</span>
          <span className="badge badge-primary badge-sm mt-1">Admin</span>
        </div>
      </div>
      {/* Navigation Menu */}
      <ul className="menu menu-md bg-transparent px-2 gap-1 flex-1">
        {navItems.map(({ to, label, icon }) => (
          <li key={to} className="my-1 w-full">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 py-2 rounded-lg transition-colors duration-200 font-medium ${
                  isActive
                    ? 'bg-primary text-primary-content menu-active shadow-md'
                    : 'hover:bg-base-300 text-base-content'
                }`
              }
              end={to === "/admin/dashboard"}
            >
              {icon} <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      {/* Theme Switcher */}
      <div className="p-4 border-t border-base-300 mt-2">
        <ThemeSwitcher />
        <span className="text-xs text-base-content/60 mt-2 block">Powered by DaisyUI</span>
      </div>
    </aside>
  );
};

export default Sidebar; 