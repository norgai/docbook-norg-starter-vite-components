
import React from 'react';
import { Link } from 'react-router-dom';
/**
 * Navbar component for conversion theme
 * Fixed navigation bar with logo and navigation links
 */
const Navbar = () => {
  const imageUrl = "/components/Navbar/ai_knowledge/fdf1f7d5-eaa1-4b32-b0d1-d97a60ee42a3.png";
  return (
    <div id="Navbar_v1" className="container mx-auto">
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <picture>
                  <source 
                    media="(min-width:1024px)" 
                    srcSet={imageUrl} 
                    sizes="100vw" 
                  />
                  <img 
                    src={imageUrl} 
                    alt="DocBook" 
                    className="h-8 w-auto object-cover mix-blend-multiply" 
                    loading="lazy" 
                  />
                </picture>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/treatments" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Treatments
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  About
                </Link>
                <Link to="/news" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  News
                </Link>
                <Link to="/booking" className="bg-brand-teal text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-teal/90">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
