import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p>This page is under construction.</p>
    </div>
  );
};

export default PlaceholderPage; 