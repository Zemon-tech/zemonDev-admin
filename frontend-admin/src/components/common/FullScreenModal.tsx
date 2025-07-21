import React from 'react';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative w-full h-full flex flex-col bg-base-100 shadow-xl overflow-auto">
        <div className="flex items-center justify-between px-8 py-6 border-b border-base-200 bg-base-100">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <button className="btn btn-ghost btn-circle" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 px-8 py-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default FullScreenModal; 