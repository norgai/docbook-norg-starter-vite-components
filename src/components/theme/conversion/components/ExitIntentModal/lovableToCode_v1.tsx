
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
/**
 * ExitIntentModal component for conversion theme
 * Displays a modal with discount offer when user attempts to leave the page
 * Features exit intent detection via mouse leave events and conversion-focused messaging
 */
const ExitIntentModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);
  const closeModal = () => {
    setIsVisible(false);
  };
  if (!isVisible) return null;
  return (
    <div id="ExitIntentModal_v1" className="container mx-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md mx-4 relative">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Wait! Before You Go...
            </h3>
            <p className="text-gray-600 mb-6">
              Get 20% off your first consultation with code WELCOME20
            </p>
            <div className="space-y-3">
              <Link
                to="/booking"
                onClick={closeModal}
                className="block w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Book Now & Save 20%
              </Link>
              <button
                onClick={closeModal}
                className="block w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExitIntentModal;
