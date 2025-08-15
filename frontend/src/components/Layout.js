import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useScrollProgress } from '../hooks/useCommon';

const Layout = ({ children }) => {
  const scrollProgress = useScrollProgress();

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      {/* Progress Bar */}
      <div className="progress-bar fixed top-0 left-0 right-0 z-50">
        <div 
          className="progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Header />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
