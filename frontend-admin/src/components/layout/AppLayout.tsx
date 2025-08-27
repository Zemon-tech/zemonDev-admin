import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { UIChromeProvider } from './UIChromeContext';

const AppLayout: React.FC = () => {
  return (
    <UIChromeProvider>
      <div className="drawer lg:drawer-open h-screen">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col h-screen">
          <Navbar />
          <main className="flex-1 w-full overflow-auto px-4 py-3 pb-20">
            <Outlet />
          </main>
        </div>
        <div className="drawer-side h-screen">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <Sidebar />
        </div>
      </div>
    </UIChromeProvider>
  );
};

export default AppLayout; 