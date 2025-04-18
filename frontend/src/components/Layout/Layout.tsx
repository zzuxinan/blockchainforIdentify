import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Optional Header can be added here */}
      {/* <header className="bg-gray-800 text-white p-4">Header</header> */}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-100 text-gray-600 text-center p-4 mt-8">
        {/* TODO: Replace with your actual Logo/Text */}
        <div className="mb-2 font-semibold">DTH FROM ZZU</div> 
        {/* TODO: Replace with your actual Motto */}
        <div>去中心化身份，链接未来</div> 
      </footer>
    </div>
  );
};

export default Layout; 