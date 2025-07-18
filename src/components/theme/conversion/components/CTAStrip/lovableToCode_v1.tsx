
import React from 'react';
import { Link } from 'react-router-dom';
interface CTAStripProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}
/**
 * CTAStrip component for conversion theme
 * A call-to-action strip with gradient background and centered content
 * Features title, description, and prominent button with hover effects
 */
const CTAStrip: React.FC<CTAStripProps> = ({ title, description, buttonText, buttonLink }) => {
  return (
    <div id="CTAStrip_v1" className="container mx-auto">
      <section className="bg-gradient-to-r from-teal-600 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {description}
          </p>
          <Link
            to={buttonLink}
            className="inline-block bg-amber-400 text-slate-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-300 transition-colors"
          >
            {buttonText}
          </Link>
        </div>
      </section>
    </div>
  );
};
export default CTAStrip;
