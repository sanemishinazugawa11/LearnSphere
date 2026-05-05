import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      {children}
    </main>
  );
};

export default Layout;