import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Flame, BookOpen, Database } from 'lucide-react';

// Custom sidebar toggle icon
const SidebarCloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" />
  </svg>
);

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
      className="select select-sm select-bordered w-full bg-opacity-80"
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
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard strokeWidth={1.5} /> },
  { to: "/admin/users", label: "Users", icon: <Users strokeWidth={1.5} /> },
  { to: "/admin/forge", label: "Forge", icon: <Flame strokeWidth={1.5} /> },
  { to: "/admin/crucible", label: "Crucible", icon: <BookOpen strokeWidth={1.5} /> },
  { to: "/admin/knowledge-base", label: "Knowledge Base", icon: <Database strokeWidth={1.5} /> },
];

const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [avatarHovered, setAvatarHovered] = useState(false);

  // Save expanded state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState) {
      setExpanded(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', String(expanded));
  }, [expanded]);

  return (
    <aside 
      className={`flex flex-col h-full ${expanded ? 'w-48' : 'w-14'} bg-base-200 shadow-md border-r border-base-300 
      transition-all duration-300 ease-in-out relative overflow-hidden backdrop-blur-sm`}
    >
      {/* Semi-transparent decorative element */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
      
      {/* Toggle Button - Only visible when sidebar is expanded */}
      {expanded && (
        <button 
          onClick={() => setExpanded(false)}
          className="absolute top-4 right-2 bg-primary/90 hover:bg-primary text-primary-content w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 z-10"
          aria-label="Collapse sidebar"
        >
          <SidebarCloseIcon />
        </button>
      )}

      {/* Admin Avatar + Badge - Acts as toggle button when collapsed */}
      <div 
        className={`flex flex-col items-center ${expanded ? 'py-6' : 'py-3'} gap-2`}
        onMouseEnter={() => !expanded && setAvatarHovered(true)}
        onMouseLeave={() => !expanded && setAvatarHovered(false)}
      >
        <div 
          className={`avatar cursor-pointer ${!expanded ? 'relative' : ''}`} 
          onClick={() => !expanded && setExpanded(true)}
        >
          {/* Overlay with sidebar icon when avatar is hovered in collapsed state */}
          {!expanded && avatarHovered && (
            <div 
              className="absolute inset-0 bg-white rounded-full z-20 transition-all duration-300 animate-in fade-in-50"
              style={{ display: 'grid', placeItems: 'center' }}
            >
              <div className="text-primary" style={{ lineHeight: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                </svg>
              </div>
            </div>
          )}
          
          <div className={`${expanded ? 'w-12 h-12' : 'w-9 h-9'} rounded-full ring ring-primary ring-opacity-60 ring-offset-base-100 ring-offset-2 shadow-md overflow-hidden transition-all duration-300`}>
            <img 
              src="/vite.svg" 
              alt="Admin Avatar" 
              className={`object-cover ${!expanded && avatarHovered ? 'opacity-75' : 'opacity-100'} transition-opacity`} 
            />
          </div>
        </div>
        {expanded && (
          <div className="flex flex-col items-center">
            <span className="font-medium text-base text-base-content">Zemon Admin</span>
            <span className="badge badge-sm badge-primary badge-outline mt-0.5 text-xs font-light">Admin</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent mb-3"></div>

      {/* Navigation Menu */}
      <div className={`px-1.5 flex flex-col gap-1.5 flex-1`}>
        {navItems.map(({ to, label, icon }) => (
          <div 
            key={to} 
            className="w-full" 
            onMouseEnter={() => setHoveredItem(to)} 
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to={to}
              className={({ isActive }) =>
                `w-full flex ${expanded ? 'items-center' : 'justify-center'} gap-2.5 py-2.5 rounded-lg 
                transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-primary/80 text-primary-content shadow-sm'
                    : hoveredItem === to
                    ? 'bg-base-300/70 text-base-content'
                    : 'hover:bg-base-300/50 text-base-content'
                }`
              }
              end={to === "/admin/dashboard"}
              title={!expanded ? label : undefined}
            >
              <div className={`${expanded ? 'ml-2.5 w-5 h-5 min-w-5' : 'w-6 h-6'} flex items-center justify-center transition-transform duration-200 ${hoveredItem === to ? 'scale-110' : ''}`}>
                {icon}
              </div>
              {expanded && (
                <span className="truncate flex-1 pr-2">{label}</span>
              )}
            </NavLink>
          </div>
        ))}
      </div>

      {/* Theme Switcher */}
      {expanded && (
        <div className="p-3 border-t border-base-300/50 mt-1">
          <ThemeSwitcher />
          <span className="text-xs text-base-content/50 mt-1.5 block text-center">Theme</span>
        </div>
      )}
      
      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
    </aside>
  );
};

export default Sidebar; 