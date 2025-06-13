

import { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { renderLinks } from '../utils/component-links';

/**
 * Layout component that provides consistent structure for all pages
 * Includes header with responsive navigation, main content via Outlet, and footer
 */

export default function Layout() {
  const location = useLocation();
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);

  // Function to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600';
  };

  // Toggle the components dropdown
  const toggleComponentsDropdown = () => {
    setIsComponentsOpen(!isComponentsOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between flex-wrap">
            <div className="flex items-center flex-shrink-0 mr-6">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Component Library
              </Link>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className={isActive('/')}>
                Home
              </Link>
              <div className="relative">
                <button
                  onClick={toggleComponentsDropdown}
                  className="flex items-center text-gray-600 hover:text-indigo-600 focus:outline-none"
                  aria-expanded={isComponentsOpen}
                >
                  Components
                  <svg
                    className={`ml-1 h-5 w-5 transition-transform ${isComponentsOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {isComponentsOpen && (
                  renderLinks()
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} Norg.ai - Component Library. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}


