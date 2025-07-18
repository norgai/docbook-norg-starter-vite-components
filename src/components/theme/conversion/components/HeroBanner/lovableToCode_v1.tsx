
import React from 'react';
import { Link } from 'react-router-dom';
/**
 * HeroBanner component for conversion theme
 * Primary hero section with call-to-action buttons for online medical consultations
 * Features gradient background and prominent messaging
 */
const HeroBanner = () => {
  return (
    <div id="HeroBanner_v1" className="container mx-auto">
      <section className="bg-gradient-to-br from-slate-900 to-teal-600 text-white py-20 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              See a Doctor Online in Minutes
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Connect with AHPRA-registered Australian doctors from anywhere. Get prescriptions, medical certificates, and expert care—all from home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/booking" 
                className="bg-amber-400 text-slate-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-300 transition-colors"
              >
                Book Now - From $49
              </Link>
              <Link 
                to="/treatments" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-slate-900 transition-colors"
              >
                View Treatments
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HeroBanner;
