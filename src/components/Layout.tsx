import { Outlet, Link, useLocation } from 'react-router-dom';

/**
 * Layout component that provides consistent structure for all pages
 * Includes header, navigation, main content via Outlet, and footer
 */
export default function Layout() {
  const location = useLocation();
  
  // Function to determine if a nav link is active
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"
              >
                My App
              </Link>
              <div className="flex space-x-6">
                <Link 
                  to="/" 
                  className={`font-medium transition-colors ${
                    isActive('/') 
                      ? 'text-primary-600' 
                      : 'text-gray-600 hover:text-primary-500'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className={`font-medium transition-colors ${
                    isActive('/about') 
                      ? 'text-primary-600' 
                      : 'text-gray-600 hover:text-primary-500'
                  }`}
                >
                  About
                </Link>
              </div>
            </div>
            <div className="hidden sm:block">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                GitHub
              </a>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <div className="container py-8 md:py-12">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gray-100 py-8 border-t border-gray-200">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 sm:mb-0">
              © {new Date().getFullYear()} My App. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}