
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component for conversion theme
 * Displays company information, service links, and legal information
 * Features dark navy background with organized grid layout
 */
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img className="h-8 w-auto" src="/lovable-uploads/fdf1f7d5-eaa1-4b32-b0d1-d97a60ee42a3.png" alt="DocBook" />
            </div>
            <p className="text-gray-300 text-sm">
              Australia's leading telehealth platform connecting you with AHPRA-registered doctors.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/online-doctor" className="text-gray-300 hover:text-white">Online Doctor</Link></li>
              <li><Link to="/medical-certificates" className="text-gray-300 hover:text-white">Medical Certificates</Link></li>
              <li><Link to="/pathology" className="text-gray-300 hover:text-white">Pathology Referrals</Link></li>
              <li><Link to="/urgent-virtual-care" className="text-gray-300 hover:text-white">Urgent Care</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/treatments" className="text-gray-300 hover:text-white">Treatments</Link></li>
              <li><Link to="/news" className="text-gray-300 hover:text-white">News</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="text-gray-300 hover:text-white">Medical Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2024 DocBook. All rights reserved. DocBook is a telehealth platform operated by licensed healthcare providers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
