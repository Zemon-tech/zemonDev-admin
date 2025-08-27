import React, { createContext, useContext, useMemo, useState } from 'react';

interface UIChromeContextValue {
  navbarTitle: React.ReactNode;
  setNavbarTitle: (node: React.ReactNode) => void;
  navbarActions: React.ReactNode;
  setNavbarActions: (node: React.ReactNode) => void;
  topbar: React.ReactNode;
  setTopbar: (node: React.ReactNode) => void;
}

const UIChromeContext = createContext<UIChromeContextValue | undefined>(undefined);

export const UIChromeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navbarTitle, setNavbarTitle] = useState<React.ReactNode>(null);
  const [navbarActions, setNavbarActions] = useState<React.ReactNode>(null);
  const [topbar, setTopbar] = useState<React.ReactNode>(null);

  const value = useMemo(() => ({ navbarTitle, setNavbarTitle, navbarActions, setNavbarActions, topbar, setTopbar }), [navbarTitle, navbarActions, topbar]);

  return (
    <UIChromeContext.Provider value={value}>
      {children}
    </UIChromeContext.Provider>
  );
};

export const useUIChrome = (): UIChromeContextValue => {
  const ctx = useContext(UIChromeContext);
  if (!ctx) throw new Error('useUIChrome must be used within UIChromeProvider');
  return ctx;
};


